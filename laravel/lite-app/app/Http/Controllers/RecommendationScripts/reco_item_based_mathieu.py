import math
import basicsfunctions
import load
import numpy as np
import pandas as pd 
import random
from sklearn.preprocessing import MultiLabelBinarizer
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.preprocessing import StandardScaler
import time
from functools import wraps

def timer_func(func):
    @wraps(func)
    def wrapper(*args, **kwargs):
        t1 = time.perf_counter()
        result = func(*args, **kwargs)
        t2 = time.perf_counter()
        print(f'La fonction {func.__name__!r} a pris {(t2-t1):.4f}s pour s\'exécuter')
        return result
    return wrapper

tracks = load.load_tracks()
users = load.load_users()

@timer_func
def create_vecteur_genre(df):
    mlb = MultiLabelBinarizer()

    genres = df['track_genres'].apply(lambda x: x if isinstance(x, list) else [])
    genre_matrix = mlb.fit_transform(genres)

    return pd.DataFrame(genre_matrix, index=df.index, columns=mlb.classes_) 
@timer_func
def create_vecteur_popularity(df):
    popularity = [
        'track_listens', 
        'track_favorites',
        'track_interest'
    ]
    matrix_vectors = df[popularity]
    return matrix_vectors

@timer_func
def merge_vecteur(vecteur1, vecteur2):
    scaler = StandardScaler()

    v1 = pd.DataFrame(vecteur1)
    v2 = pd.DataFrame(vecteur2)
    merged_v = pd.concat([v1, v2], axis=1)

    scaled_vecteur = scaler.fit_transform(merged_v)

    return scaled_vecteur

@timer_func
def create_matrice_similitude(df,vecteur):
    cosine_sim = cosine_similarity(vecteur)
    
    indices = pd.Series(df.index, index=df['track_id']).drop_duplicates()
    return cosine_sim, indices

@timer_func
def recommendation_id(track_id, df, cosine_sim, indices, sim_ratio, seuil_sim, n):
    try:
        idx = indices.loc[track_id]
    except KeyError:
        print(f"L'ID {track_id} n'a pas été trouvé.")
        return pd.DataFrame() 
    
    print(f"Nombre de morceaux : {n}")
    print(f"Seuil de similitude : {seuil_sim}")
    print(f"Ratio de similitude : {sim_ratio} {int(sim_ratio * 10)} morceaux similaires et {int(n - (sim_ratio * 10))} morceaux de découvertes")


    sim_scores = list(enumerate(cosine_sim[idx]))
    
    sim_scores = sorted(sim_scores, key=lambda x: x[1], reverse=True)

    valid_scores = [x for x in sim_scores[1:] if x[1] >= seuil_sim]
    
    n_sim_tracks = int(round(n * sim_ratio))
    n_discover_tracks = n - n_sim_tracks

    final_selection = valid_scores[:n_sim_tracks]

    discovery_pool = valid_scores[n_sim_tracks:]
    
    if n_discover_tracks > 0 and len(discovery_pool) > 0:
        k = min(len(discovery_pool), n_discover_tracks)
        discovery_selection = discovery_pool[-k:]

        final_selection += discovery_selection

    track_indices = [pair[0] for pair in final_selection]
    track_scores = [pair[1] for pair in final_selection]

    result_df = df.iloc[track_indices].copy()

    result_df['score_similarite'] = track_scores

    return result_df

def get_recommendations_json(track_id, n, sim_ratio, seuil_sim):
    """Retourne une liste de track_ids en JSON"""
    vecteur1 = create_vecteur_popularity(tracks)
    vecteur2 = create_vecteur_genre(tracks)
    merge_pop_genre = merge_vecteur(vecteur1, vecteur2)
    m, indices = create_matrice_similitude(tracks, merge_pop_genre)
    
    recos = recommendation_id(track_id, tracks, m, indices, sim_ratio, seuil_sim, n)
    
    if recos.empty:
        return []
    
    return [int(tid) for tid in recos['track_id'].tolist()]


if __name__ == "__main__":
    import sys
    import json
    
    if len(sys.argv) < 3:
        print(json.dumps([]))
        sys.exit(1)
    
    track_id = int(sys.argv[1])
    n = int(sys.argv[2])
    sim_ratio = float(sys.argv[3]) if len(sys.argv) > 3 else 0.8
    seuil_sim = float(sys.argv[4]) if len(sys.argv) > 4 else 0.4
    
    track_ids = get_recommendations_json(track_id, n, sim_ratio, seuil_sim)
    print(json.dumps(track_ids))
