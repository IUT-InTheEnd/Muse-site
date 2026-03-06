import math
import psycopg2
import pandas as pd
import numpy as np
import ast
from collections import Counter

# ----- Connexion à la DB -----
def connection_db():
    return psycopg2.connect(
        dbname="InTheEnd_DB",
        user="InTheEnd_User",
        password="InTheEnd_Password",
        host="localhost",
        port="25000"
    )

# ----- Colonnes -----
columns = [
    "user_id", "user_age", "user_job", "user_plays_music", "user_gender",
    "user_instruments", "user_music_contexts", "profile_id", "music_envy_today",
    "feeling", "music_preference", "music_style_preference", "music_reason",
    "listening_context", "current_music_type", "usual_listening_mode",
    "likes_discovery", "attend_live_concert", "repeat_listening", "explicit_ok",
    "avg_song_length", "avg_daily_listen_time"
]

numeric_cols = [
    "user_age", "music_preference", "music_style_preference", "attend_live_concert",
    "explicit_ok", "current_music_type", "repeat_listening", 
    "avg_daily_listen_time", "feeling", "usual_listening_mode", "likes_discovery",
    "user_plays_music"
]

categorical_cols = [
    "user_job", "user_gender","avg_song_length",
]

multilabel_cols = [
    "user_instruments", "user_music_contexts", "listening_context", "music_reason",
    "music_envy_today", "preference_language", "genres_favoris"
]

# ----- Fonction pour transformer les colonnes multi-label en listes -----
def ensure_list(x):
    if isinstance(x, list):
        return x
    elif isinstance(x, str) and x.startswith("["):
        return ast.literal_eval(x)
    elif x is None or (isinstance(x, float) and np.isnan(x)):
        return []
    else:
        return [x]

# ----- Fonction pour récupérer les données utilisateurs depuis la BDD -----
def pull_data_user(cursor):
    cursor.execute("SELECT * FROM \"user\" u JOIN user_profile up ON u.profile_id = up.user_profile_id;")
    users = cursor.fetchall()
    cols_db = [desc[0] for desc in cursor.description]    # colonnes users de la BDD

    # construire un mapping user_id -> [language_name, ...]
    cursor.execute("""
        SELECT up.user_id, l.language_label
        FROM user_parle up
        JOIN language l ON up.language_id = l.language_id
    """)
    langs = cursor.fetchall()
    lang_map = {}
    for uid, lname in langs:
        lang_map.setdefault(uid, []).append(lname)

    # construire un mapping user_id -> [genre_name, ...]
    cursor.execute("""
        SELECT ag.user_id, g.genre_title
        FROM ajoute_genre_favoris ag
        JOIN genre g ON ag.genre_id = g.genre_id
    """)
    genres = cursor.fetchall()
    genre_map = {}
    for uid, gname in genres:
        genre_map.setdefault(uid, []).append(gname)

    cols_keep = [c for c in columns if c in cols_db]      # intersection dans l'ordre de `columns`
    idx_map = {c: cols_db.index(c) for c in cols_keep}    # position de chaque colonne dans `users`

    # Convertir en dictionnaires en ne gardant que les colonnes sélectionnées
    user_dicts = []
    for user in users:
        d = {k: user[idx_map[k]] for k in cols_keep}
        # ajouter languages/genres associés au user_id
        uid = d.get("user_id")
        d["preference_language"] = lang_map.get(uid, [])
        d["genres_favoris"] = genre_map.get(uid, [])
        for col in multilabel_cols:
            if col in d:
                d[col] = ensure_list(d[col])
        user_dicts.append(d)
    
    df = pd.DataFrame(user_dicts)
    
    # Convertir les colonnes numériques en float (coerce les valeurs invalides en NaN)
    for col in numeric_cols:
        df[col] = pd.to_numeric(df[col], errors='coerce')

    return df

# ----- Fonction pour compléter un utilisateur peu rempli -----
def complete_user(new_user, df, numeric_cols, categorical_cols, multilabel_cols):
    user_completed = new_user.copy()

    def is_provided(v):
        if v is None: return False
        if isinstance(v, str): return v.strip() != ""
        if isinstance(v, (list, tuple, set)): return len(v) > 0
        if isinstance(v, float) and np.isnan(v): return False
        return True

    def norm_scalar(v):
        if v is None: return None
        if isinstance(v, float) and np.isnan(v): return None
        return str(v).strip().lower()

    def norm_numeric(v):
        try:
            return float(v)
        except Exception:
            return None

    def norm_list(v):
        lst = ensure_list(v)
        return [str(x).strip().lower() for x in lst if x is not None and str(x).strip() != ""]

    # colonnes effectivement fournies
    provided = {k: v for k, v in user_completed.items() if k in df.columns and is_provided(v)}

    if len(provided) == 0:
        # new_user vide -> utiliser tous les utilisateurs pour le calcul
        print("[complete_user] new_user vide -> utilisation de tous les utilisateurs pour le calcul")
        filtered = df.copy()
    else:
        # on conserve user_keep (OR) pour debug/fallback et on calcule aussi le filtre >=50%
        user_keep = pd.Series(False, index=df.index)   # OR sur les attributs (existant)
        mask_cols = []            # colonnes de masks pour le calcul 50%
        meaningful_cols = []

        for col, val in provided.items():
            if col in multilabel_cols:
                prov_set = set(norm_list(val))
                if len(prov_set) == 0:
                    continue
                ser = df[col].apply(lambda items: set(norm_list(items)))
                user_keep_col = ser.apply(lambda s: len(s & prov_set) > 0).fillna(False)
                mask_col = user_keep_col
            elif col in numeric_cols:
                num = norm_numeric(val)
                if num is None:
                    norm_val = norm_scalar(val)
                    user_keep_col = (df[col].fillna("").astype(str).str.strip().str.lower() == norm_val).fillna(False)
                else:
                    ser_num = pd.to_numeric(df[col], errors='coerce')
                    user_keep_col = (ser_num.notna() & np.isclose(ser_num, num)).fillna(False)
                mask_col = user_keep_col
            else:
                norm_val = norm_scalar(val)
                user_keep_col = (df[col].fillna("").astype(str).str.strip().str.lower() == norm_val).fillna(False)
                mask_col = user_keep_col

            # construire OR et stocker par-colonne
            user_keep |= user_keep_col
            mask_cols.append(mask_col)
            meaningful_cols.append(col)

        # logging OR-result (existant)
        n_selected_or = int(user_keep.sum())
        total = len(df)
        print(f"[complete_user] users retenus par OR (au moins 1 attribut) : {n_selected_or}/{total}")

        # calcul du filtre >=50%
        n_provided = len(meaningful_cols)
        if n_provided == 0:
            print("[complete_user] aucune colonne significative fournie -> utilisation du dataset complet")
            filtered = df.copy()
            final_mask = pd.Series(True, index=df.index)
        else:
            mask_df = pd.concat(mask_cols, axis=1)
            matches = mask_df.sum(axis=1)
            threshold = math.ceil(0.5 * n_provided)
            final_mask = matches >= threshold

            n_selected = int(final_mask.sum())
            print(f"[complete_user] utilisateurs retenus >=50% : {n_selected}/{total}")

            if n_selected < 5:
                # fallback : si personne n'atteint 50%, utiliser user_keep (si non vide) sinon tout le dataset
                if n_selected_or > 0:
                    print("[complete_user] pas assez d'utilisateur >=50% -> fallback sur OR (au moins 1 attribut)")
                    filtered = df[user_keep].copy()
                else:
                    print("[complete_user] aucun utilisateur trouvé -> utilisation du dataset complet")
                    filtered = df.copy()
                    final_mask = pd.Series(True, index=df.index)
            else:
                filtered = df.loc[final_mask].copy()
            
    # compléter uniquement les colonnes non fournies
    for col in numeric_cols:
        if col in user_completed and not is_provided(user_completed[col]):
            if col in filtered.columns and filtered[col].dropna().shape[0] > 0:
                user_completed[col] = math.floor(filtered[col].mean() + 0.5)
            else:
                user_completed[col] = math.floor(df[col].mean() + 0.5) if col in df.columns else 0

    for col in categorical_cols:
        if col in user_completed and not is_provided(user_completed[col]):
            if col in filtered.columns and filtered[col].dropna().shape[0] > 0:
                user_completed[col] = filtered[col].mode().iloc[0]
            else:
                user_completed[col] = df[col].mode().iloc[0] if col in df.columns and df[col].dropna().shape[0] > 0 else ""

    TOP_K = 2
    for col in multilabel_cols:
        if col in user_completed:
            provided_items = user_completed.get(col)
            provided_items = ensure_list(provided_items)
            if is_provided(provided_items):
                user_completed[col] = provided_items
            else:
                counter = Counter()
                if col in filtered.columns:
                    for items in filtered[col]:
                        if isinstance(items, (list, tuple, set)):
                            counter.update(items)
                user_completed[col] = [item for item, _ in counter.most_common(TOP_K)]
    
    final_cols = [c for c in df.columns if c not in ("user_id", "profile_id")] # retirer les ids
    completed_df = pd.DataFrame([user_completed], columns=final_cols)

    # caster les colonnes numériques
    for c in numeric_cols:
        if c in completed_df.columns:
            completed_df[c] = pd.to_numeric(completed_df[c], errors='coerce').fillna(0)

    # s'assurer que les colonnes multilabel contiennent des listes
    def to_list_cell(x):
        if isinstance(x, list):
            return x
        if isinstance(x, str) and x.startswith("["):
            try:
                return ast.literal_eval(x)
            except Exception:
                return [x]
        if pd.isna(x):
            return []
        return [x]

    for c in multilabel_cols:
        if c in completed_df.columns:
            completed_df[c] = completed_df[c].apply(to_list_cell)

    completed_df.drop(columns=["user_id", "profile_id"], errors='ignore', inplace=True)

    return completed_df

# ----- Fonction pour afficher un utilisateur -----
def afficher_user(completed_df):
    print("--------------")
    print("Completed user (DataFrame):")

    for col in completed_df.columns:
        print(f"- {col}: {completed_df.at[0, col]}")
    print("--------------")

# ----- Fonction pour récupérer les tracks correspondants aux critères de l'utilisateur -----
def tracks_recommendation(cursor, completed_df):
    style = completed_df["music_style_preference"][0] # acoustique ou non
    explicit_ok = completed_df["explicit_ok"][0]
    avg_len = completed_df["avg_song_length"][0]
    langs = completed_df["preference_language"][0]
    genres = completed_df["genres_favoris"][0]

    base = """
        SELECT DISTINCT track_id, track_title, artist_name
        FROM (track
        NATURAL JOIN track_chanter_en
        NATURAL JOIN realiser
        NATURAL JOIN artist
        NATURAL JOIN contient_genres
        NATURAL JOIN genre
        NATURAL JOIN language)
        WHERE 1=1
    """

    params = []

    # style preference
    if style == 0:
        base += " AND track_instrumental = true"
    elif style == 1:
        base += " AND track_instrumental = false"

    # explicit content
    if explicit_ok == 1:
        base += " AND track_explicit = true"
    else:
        base += " AND track_explicit = false"

    # track duration
    if avg_len == 2:
        base += " AND track_duration <= 180"
    elif avg_len == 4.5:
        base += " AND track_duration > 180 AND track_duration <= 360"
    else:
        base += " AND track_duration > 360"

    # languages
    if langs:
        placeholders = ",".join(["%s"] * len(langs))
        base += f" AND language_label IN ({placeholders}) "
        params.extend(langs)

    # genres
    if genres:
        placeholders = ",".join(["%s"] * len(genres))
        base += f" AND genre_title IN ({placeholders})"
        params.extend(genres)

    cursor.execute(f"SELECT * FROM ({base}) ORDER BY RANDOM() LIMIT 10;", tuple(params))
    tracks = cursor.fetchall()

    return tracks

# ----- Fonction pour afficher les tracks recommandés -----
def afficher_tracks(tracks):
    print("Recommended Tracks:")
    for track in tracks:
        print(f"- (ID: {track[0]}) {track[1]} by {track[2]}")
    print("--------------")

def main():
    conn = connection_db()
    cursor = conn.cursor()
    
    df = pull_data_user(cursor)
    
    # Nouvel utilisateur
    new_user = {
        "user_age": None,
        "user_job": "Sans emploi",
        "user_plays_music": None,
        "user_gender": "Femme",
        "user_instruments": [],
        "user_music_contexts": [],
        "music_envy_today": [],
        "feeling": None,
        "music_preference": None,
        "music_style_preference": None,
        "music_reason": [],
        "listening_context": [],
        "current_music_type": None,
        "usual_listening_mode": 0,
        "likes_discovery": 1,
        "attend_live_concert": None,
        "repeat_listening": None,
        "explicit_ok": 2,
        "avg_song_length": None,
        "avg_daily_listen_time": None,
        "preference_language" : [],
        "genres_favoris": []
    }
    
    completed_user = complete_user(new_user, df, numeric_cols, categorical_cols, multilabel_cols)
    afficher_user(completed_user)

    tracks = tracks_recommendation(cursor, completed_user)
    afficher_tracks(tracks)


def get_recommendations_json(user_id, n, user_profile=None):
    """Retourne une liste de track_ids en JSON"""
    import json
    
    conn = connection_db()
    cursor = conn.cursor()
    
    df = pull_data_user(cursor)
    
    # Charger le profil utilisateur existant ou utiliser celui fourni
    if user_profile:
        new_user = user_profile
    else:
        # Créer un profil vide qui sera complété
        new_user = {
            "user_age": None,
            "user_job": None,
            "user_plays_music": None,
            "user_gender": None,
            "user_instruments": [],
            "user_music_contexts": [],
            "music_envy_today": [],
            "feeling": None,
            "music_preference": None,
            "music_style_preference": None,
            "music_reason": [],
            "listening_context": [],
            "current_music_type": None,
            "usual_listening_mode": None,
            "likes_discovery": None,
            "attend_live_concert": None,
            "repeat_listening": None,
            "explicit_ok": None,
            "avg_song_length": None,
            "avg_daily_listen_time": None,
            "preference_language": [],
            "genres_favoris": []
        }
    
    completed_user = complete_user(new_user, df, numeric_cols, categorical_cols, multilabel_cols)
    tracks = tracks_recommendation(cursor, completed_user)
    
    cursor.close()
    conn.close()
    
    # Extraire uniquement les track_ids (limité à n)
    track_ids = [int(track[0]) for track in tracks[:n]]
    return track_ids


if __name__ == "__main__":
    import sys
    import json
    
    if len(sys.argv) < 2:
        print(json.dumps([]))
        sys.exit(1)
    
    user_id = int(sys.argv[1])
    n = int(sys.argv[2]) if len(sys.argv) > 2 else 10
    user_profile = json.loads(sys.argv[3]) if len(sys.argv) > 3 and sys.argv[3] != '{}' else None
    
    track_ids = get_recommendations_json(user_id, n, user_profile)
    print(json.dumps(track_ids))