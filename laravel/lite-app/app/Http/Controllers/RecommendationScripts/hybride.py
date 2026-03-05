import sys
import reco_steph_echonest
import reco_user_based_p2
import reco_user_based_p3
import load

def hybride_recommendation(track_id, n, compareGenre, target_user_id, get_title=False, top_k=10, use_p3_scoring=True):
    conn = reco_user_based_p2.connection_db()
    all_users_df = load.load_users()

    # Charger les données des pistes
    tracks_df = load.load_tracks()

    # Trouver des utilisateurs similaires
    similar_users = reco_user_based_p2.find_similar_users_by_favorites(target_user_id, all_users_df, conn, similarity_threshold=0.1)

    # Obtenir des recommandations user-based
    recommendations_ub = reco_user_based_p2.recommend_based_on_similar_users(target_user_id, similar_users, tracks_df, get_title, top_k)

    # Obtenir des recommandations item-based
    recommendations_ib = reco_steph_echonest.echonest_recommend(target_user_id, track_id, n, compareGenre)

    # Utiliser le scoring avancé de user_based_p3 pour affiner les prédictions
    if use_p3_scoring and len(recommendations_ub) > 0:
        try:
            scored_recommendations = []
            for rec in recommendations_ub:
                rec_track_id = rec[0] if isinstance(rec, tuple) else rec
                try:
                    score = reco_user_based_p3.get_pred_for_user(target_user_id, rec_track_id)
                    scored_recommendations.append((rec_track_id, score))
                except Exception:
                    scored_recommendations.append((rec_track_id, 0))
            # Trier par score décroissant
            scored_recommendations.sort(key=lambda x: x[1], reverse=True)
            recommendations_ub = [(rec[0], rec[1]) for rec in scored_recommendations]
        except Exception as e:
            print(f"Scoring p3 non applicable: {e}", file=sys.stderr)

    conn.close()

    print("Recommandations user-based :", file=sys.stderr)
    for rec in recommendations_ub:
        print(rec, file=sys.stderr)

    print("Recommandations item-based :", file=sys.stderr)
    for rec2 in recommendations_ib:
        print(rec2, file=sys.stderr)

    recommendations = []

    # ---------- CAS 1 : pas de user-based ----------
    if len(recommendations_ub) == 0:
        for rec2 in recommendations_ib:
            recommendations.append(rec2[0])

    # ---------- CAS 2 : pas de item-based ----------
    elif len(recommendations_ib) == 0:
        for rec in recommendations_ub:
            recommendations.append(rec[0])

    # ---------- CAS 3 : assez de recommandations ----------
    elif len(recommendations_ub) + len(recommendations_ib) >= n:
        # Intersection
        for rec in recommendations_ub:
            for rec2 in recommendations_ib:
                if rec2[0] == rec[0]:
                    recommendations.append(rec[0])

        # pour compléter avec des recommandations pas en communs afin d'atteindre n
        if len(recommendations) < n:
            i = 0
            j = 0
            while len(recommendations) < n:
                if i >= len(recommendations_ub) and j >= len(recommendations_ib):
                    break
                if i < len(recommendations_ub):
                    if recommendations_ub[i][0] not in recommendations:
                        recommendations.append(recommendations_ub[i][0])
                if len(recommendations) < n and j < len(recommendations_ib):
                    if recommendations_ib[j][0] not in recommendations:
                        recommendations.append(recommendations_ib[j][0])
                i += 1
                j += 1

    # ---------- CAS 4 : pas assez de recommandations ----------
    else:
        # Intersection
        for rec in recommendations_ub:
            for rec2 in recommendations_ib:
                if rec2[0] == rec[0]:
                    recommendations.append(rec[0])

        # pour compléter avec des recommandations pas en communs afin d'atteindre n
        if len(recommendations) < n:
            i = 0
            j = 0
            while len(recommendations) < n:
                if i >= len(recommendations_ub) and j >= len(recommendations_ib):
                    break
                if i < len(recommendations_ub):
                    if recommendations_ub[i][0] not in recommendations:
                        recommendations.append(recommendations_ub[i][0])
                if len(recommendations) < n and j < len(recommendations_ib):
                    if recommendations_ib[j][0] not in recommendations:
                        recommendations.append(recommendations_ib[j][0])
                i += 1
                j += 1

        print("Pas assez de recommandations disponibles pour atteindre le nombre demandé.", file=sys.stderr)

    return recommendations


def get_recommendations_json(user_id, track_id, n, compare_genre, top_k):
    """Retourne une liste de track_ids en JSON"""
    return hybride_recommendation(
        track_id=track_id,
        n=n,
        compareGenre=compare_genre,
        target_user_id=user_id,
        get_title=False,
        top_k=top_k,
        use_p3_scoring=True
    )


if __name__ == "__main__":
    import sys
    import json
    
    if len(sys.argv) < 4:
        print(json.dumps([]))
        sys.exit(1)
    
    user_id = int(sys.argv[1])
    track_id = int(sys.argv[2])
    n = int(sys.argv[3])
    compare_genre = sys.argv[4].lower() == 'true' if len(sys.argv) > 4 else True
    top_k = int(sys.argv[5]) if len(sys.argv) > 5 else 10
    
    track_ids = get_recommendations_json(user_id, track_id, n, compare_genre, top_k)
    # S'assurer que tous les éléments sont des int
    track_ids = [int(tid) for tid in track_ids]
    print(json.dumps(track_ids))
