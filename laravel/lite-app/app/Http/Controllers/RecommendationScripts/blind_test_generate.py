import json
import math
import random
import sys
from typing import Any, Optional, Union

import psycopg2

import reco_steph_echonest
import reco_user_based_p1
import reco_user_based_p2


def connection_db():
    return psycopg2.connect(
        dbname="InTheEnd_DB",
        user="InTheEnd_User",
        password="InTheEnd_Password",
        host="localhost",
        port="25000",
    )


def normalize_int_list(values: Any) -> list[int]:
    if not isinstance(values, list):
        return []

    normalized = []
    for value in values:
        try:
            normalized.append(int(value))
        except (TypeError, ValueError):
            continue

    return list(dict.fromkeys(normalized))


def build_filter_clauses(filters: dict[str, Any], language_codes: list[str]) -> tuple[list[str], list[Any]]:
    clauses = ["NULLIF(BTRIM(t.track_file), '') IS NOT NULL"]
    params: list[Any] = []

    year_min = filters.get("year_min")
    if year_min is not None:
        clauses.append(
            "COALESCE(EXTRACT(YEAR FROM t.track_date_recorded)::int, EXTRACT(YEAR FROM t.track_date_created)::int) >= %s"
        )
        params.append(int(year_min))

    year_max = filters.get("year_max")
    if year_max is not None:
        clauses.append(
            "COALESCE(EXTRACT(YEAR FROM t.track_date_recorded)::int, EXTRACT(YEAR FROM t.track_date_created)::int) <= %s"
        )
        params.append(int(year_max))

    genre_ids = normalize_int_list(filters.get("genre_ids"))
    if genre_ids:
        clauses.append(
            "EXISTS (SELECT 1 FROM contient_genres cg WHERE cg.track_id = t.track_id AND cg.genre_id = ANY(%s))"
        )
        params.append(genre_ids)

    artist_ids = normalize_int_list(filters.get("artist_ids"))
    if artist_ids:
        clauses.append(
            "EXISTS (SELECT 1 FROM realiser r WHERE r.track_id = t.track_id AND r.artist_id = ANY(%s))"
        )
        params.append(artist_ids)

    vocal_type = filters.get("vocal_type")
    if vocal_type == "instrumental":
        clauses.append("(t.track_instrumental = TRUE OR COALESCE(te.instrumentalness, 0) >= 0.5)")
    elif vocal_type == "spoken":
        clauses.append("COALESCE(te.speechiness, 0) >= 0.5")

    language_ids = normalize_int_list(filters.get("language_ids"))
    if language_ids:
        language_clause = [
            "EXISTS (SELECT 1 FROM track_chanter_en tce WHERE tce.track_id = t.track_id AND tce.language_id = ANY(%s))"
        ]
        params.append(language_ids)

        if language_codes:
            language_clause.append(
                "(NOT EXISTS (SELECT 1 FROM track_chanter_en tce2 WHERE tce2.track_id = t.track_id) AND t.track_language_code = ANY(%s))"
            )
            params.append(language_codes)

        clauses.append(f"({' OR '.join(language_clause)})")

    return clauses, params


def fetch_language_codes(cursor, language_ids: list[int]) -> list[str]:
    if not language_ids:
        return []

    cursor.execute(
        """
        SELECT language_code
        FROM language
        WHERE language_id = ANY(%s)
          AND NULLIF(BTRIM(language_code), '') IS NOT NULL
        """,
        (language_ids,),
    )

    return [row[0] for row in cursor.fetchall()]


def fetch_filtered_track_listens(cursor, filters: dict[str, Any], language_codes: list[str]) -> list[tuple[int, int]]:
    clauses, params = build_filter_clauses(filters, language_codes)
    where_clause = " AND ".join(clauses)

    cursor.execute(
        f"""
        SELECT t.track_id, COALESCE(t.track_listens, 0) AS track_listens
        FROM track t
        LEFT JOIN track_echonest te ON te.track_id = t.track_id
        WHERE {where_clause}
        """,
        params,
    )

    return [(int(row[0]), int(row[1] or 0)) for row in cursor.fetchall()]


def percentile(values: list[int], ratio: float) -> int:
    if not values:
        return 0

    ordered = sorted(values)
    index = min(len(ordered) - 1, max(0, math.floor((len(ordered) - 1) * ratio)))

    return ordered[index]


def allowed_track_ids_by_popularity(
    tracks: list[tuple[int, int]],
    popularity: Optional[str],
) -> Optional[set[int]]:
    if not popularity or popularity not in {"low", "medium", "high"}:
        return None

    listens = [track_listens for _, track_listens in tracks]
    low_limit = percentile(listens, 1 / 3)
    high_limit = percentile(listens, 2 / 3)

    allowed = set()
    for track_id, track_listens in tracks:
        if popularity == "low" and track_listens <= low_limit:
            allowed.add(track_id)
        elif popularity == "medium" and low_limit <= track_listens <= high_limit:
            allowed.add(track_id)
        elif popularity == "high" and track_listens >= high_limit:
            allowed.add(track_id)

    return allowed


def fetch_known_pool(
    cursor,
    user_id: int,
    filters: dict[str, Any],
    language_codes: list[str],
) -> list[dict[str, Union[float, int]]]:
    clauses, params = build_filter_clauses(filters, language_codes)
    where_clause = " AND ".join(["ue.user_id = %s", *clauses])

    cursor.execute(
        f"""
        SELECT DISTINCT t.track_id, COALESCE(ue.nb_ecoute, 0) AS nb_ecoute
        FROM user_ecoute ue
        JOIN track t ON t.track_id = ue.track_id
        LEFT JOIN track_echonest te ON te.track_id = t.track_id
        WHERE {where_clause}
        """,
        [user_id, *params],
    )

    rows = cursor.fetchall()
    max_listens = max((int(row[1] or 0) for row in rows), default=0)
    denominator = max_listens if max_listens > 0 else 1

    pool = []
    for track_id, nb_ecoute in rows:
        listens = int(nb_ecoute or 0)
        score = 1 - (listens / denominator)
        pool.append(
            {
                "track_id": int(track_id),
                "score": max(score, 0.01),
            }
        )

    return pool


def user_has_history(cursor, user_id: int) -> bool:
    cursor.execute("SELECT EXISTS(SELECT 1 FROM user_ecoute WHERE user_id = %s)", (user_id,))

    return bool(cursor.fetchone()[0])


def fetch_last_track_id(cursor, user_id: int) -> Optional[int]:
    cursor.execute(
        """
        SELECT track_id
        FROM user_ecoute
        WHERE user_id = %s
        ORDER BY last_listen DESC NULLS LAST
        LIMIT 1
        """,
        (user_id,),
    )

    row = cursor.fetchone()

    return int(row[0]) if row else None


def merge_ranked_scores(score_map: dict[int, float], track_ids: list[int], weight: float = 1.0) -> None:
    total = len(track_ids)
    if total == 0:
        return

    for index, track_id in enumerate(track_ids):
        rank_score = (total - index) / total
        score_map[track_id] = score_map.get(track_id, 0.0) + (rank_score * weight)


def get_recommendation_scores(cursor, user_id: int, n_large: int) -> dict[int, float]:
    score_map: dict[int, float] = {}
    history_available = user_has_history(cursor, user_id)

    if history_available:
        try:
            merge_ranked_scores(score_map, reco_user_based_p2.get_recommendations_json(user_id, n_large), 1.0)
        except Exception as exc:
            print(f"userBased failed: {exc}", file=sys.stderr)

        last_track_id = fetch_last_track_id(cursor, user_id)
        if last_track_id is not None:
            try:
                echo_recommendations = reco_steph_echonest.echonest_recommend(user_id, last_track_id, n_large, True)
                merge_ranked_scores(score_map, [int(track_id) for track_id, _ in echo_recommendations], 0.9)
            except Exception as exc:
                print(f"echoNest failed: {exc}", file=sys.stderr)

    if not score_map:
        try:
            merge_ranked_scores(score_map, reco_user_based_p1.get_recommendations_json(n_large), 0.8)
        except Exception as exc:
            print(f"newUser failed: {exc}", file=sys.stderr)

    return score_map


def fetch_unknown_pool(
    cursor,
    user_id: int,
    filters: dict[str, Any],
    language_codes: list[str],
    recommendation_scores: dict[int, float],
) -> list[dict[str, Union[float, int]]]:
    if not recommendation_scores:
        return []

    clauses, params = build_filter_clauses(filters, language_codes)
    where_clause = " AND ".join(
        [
            "t.track_id = ANY(%s)",
            "NOT EXISTS (SELECT 1 FROM user_ecoute ue WHERE ue.user_id = %s AND ue.track_id = t.track_id)",
            *clauses,
        ]
    )

    candidate_ids = list(recommendation_scores.keys())

    cursor.execute(
        f"""
        SELECT DISTINCT t.track_id
        FROM track t
        LEFT JOIN track_echonest te ON te.track_id = t.track_id
        WHERE {where_clause}
        """,
        [candidate_ids, user_id, *params],
    )

    return [
        {
            "track_id": int(track_id),
            "score": max(float(recommendation_scores.get(int(track_id), 0.0)), 0.01),
        }
        for track_id, in cursor.fetchall()
    ]


def weighted_sample_without_replacement(
    pool: list[dict[str, Union[float, int]]],
    count: int,
) -> list[int]:
    if count <= 0 or not pool:
        return []

    remaining = [dict(item) for item in pool]
    selection: list[int] = []

    while remaining and len(selection) < count:
        weights = [max(float(item["score"]), 0.01) for item in remaining]
        picked_index = random.choices(range(len(remaining)), weights=weights, k=1)[0]
        picked = remaining.pop(picked_index)
        selection.append(int(picked["track_id"]))

    return selection


def remainder_pool(
    pool: list[dict[str, Union[float, int]]],
    selected_ids: list[int],
) -> list[dict[str, Union[float, int]]]:
    selected = set(selected_ids)
    return [item for item in pool if int(item["track_id"]) not in selected]


def interleave_tracks(primary: list[int], secondary: list[int]) -> list[int]:
    merged: list[int] = []
    max_length = max(len(primary), len(secondary))

    for index in range(max_length):
        if index < len(primary):
            merged.append(primary[index])
        if index < len(secondary):
            merged.append(secondary[index])

    return merged


def generate_blind_test(user_id: int, payload: dict[str, Any]) -> dict[str, Any]:
    n = int(payload.get("count", 10))
    filters = payload.get("filters", {}) if isinstance(payload.get("filters"), dict) else {}

    conn = connection_db()
    try:
        cursor = conn.cursor()
        language_codes = fetch_language_codes(cursor, normalize_int_list(filters.get("language_ids")))
        filtered_track_listens = fetch_filtered_track_listens(cursor, filters, language_codes)
        popularity_allowed_ids = allowed_track_ids_by_popularity(filtered_track_listens, filters.get("popularity"))

        known_pool = fetch_known_pool(cursor, user_id, filters, language_codes)
        recommendation_scores = get_recommendation_scores(cursor, user_id, max(n * 6, 50))
        unknown_pool = fetch_unknown_pool(cursor, user_id, filters, language_codes, recommendation_scores)
    finally:
        conn.close()

    if popularity_allowed_ids is not None:
        known_pool = [item for item in known_pool if int(item["track_id"]) in popularity_allowed_ids]
        unknown_pool = [item for item in unknown_pool if int(item["track_id"]) in popularity_allowed_ids]

    known_target = n // 2
    unknown_target = n - known_target

    known_selected = weighted_sample_without_replacement(known_pool, known_target)
    unknown_selected = weighted_sample_without_replacement(unknown_pool, unknown_target)

    if len(known_selected) < known_target:
        missing = known_target - len(known_selected)
        unknown_selected.extend(
            weighted_sample_without_replacement(remainder_pool(unknown_pool, unknown_selected), missing)
        )

    if len(unknown_selected) < unknown_target:
        missing = unknown_target - len(unknown_selected)
        known_selected.extend(
            weighted_sample_without_replacement(remainder_pool(known_pool, known_selected), missing)
        )

    track_ids = interleave_tracks(known_selected, unknown_selected)
    track_ids = list(dict.fromkeys(track_ids))

    if len(track_ids) < n:
        return {
            "error": "Les filtres sont trop restrictifs pour générer ce blind test.",
            "details": {
                "requested_count": n,
                "known_available": len(known_pool),
                "unknown_available": len(unknown_pool),
                "generated_count": len(track_ids),
            },
        }

    return {
        "track_ids": track_ids[:n],
        "counts": {
            "requested": n,
            "known_selected": len(known_selected),
            "unknown_selected": len(unknown_selected),
            "known_available": len(known_pool),
            "unknown_available": len(unknown_pool),
        },
    }


if __name__ == "__main__":
    if len(sys.argv) < 3:
        print(json.dumps({"error": "Missing arguments"}))
        sys.exit(1)

    try:
        user_id = int(sys.argv[1])
        payload = json.loads(sys.argv[2])
    except (ValueError, json.JSONDecodeError):
        print(json.dumps({"error": "Invalid input payload"}))
        sys.exit(1)

    try:
        result = generate_blind_test(user_id, payload)
        print(json.dumps(result))
    except Exception as exc:
        print(json.dumps({"error": str(exc)}))
        sys.exit(1)
