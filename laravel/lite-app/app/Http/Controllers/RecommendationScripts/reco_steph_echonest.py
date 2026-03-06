import sys
import pandas as pd
from sklearn.preprocessing import MinMaxScaler
import basicsfunctions
import load


tracks = load.load_tracks()
users = load.load_users()
artists_tracks = load.load_realiser()
genres = load.load_genres()

# print(tracks)
# print(users)

# normalisation du tempo pour qu'il soit entre 0 et 1
scaler = MinMaxScaler()
tracks['tempo_norm'] = scaler.fit_transform(tracks[['tempo']])

# vecteurs pour echonest
echonest = {}

for _, row in tracks.iterrows():
    track_id = row['track_id'] #pour les tracks sans echonest

    # les tracks avec echonest, track_id est une Serie
    if isinstance(track_id, pd.Series):
        track_id = track_id.iloc[0]

    echonest[track_id] = [
        row['acousticness'],
        row['energy'],
        row['instrumentalness'],
        row['liveness'],
        row['speechiness'],
        row['valence'],
        row['danceability'],
        row['tempo_norm']
    ]


#affichage des 10 premiers éléments de echonest
# for i, (key, value) in enumerate(echonest.items()):
#     if i >= 10:
#         break
#     print(key, value)


def hasSameParentGenre(track_id1, track_id2):
    g1 = tracks.loc[tracks['track_id'] == track_id1, 'track_genres'].values[0]
    g2 = tracks.loc[tracks['track_id'] == track_id2, 'track_genres'].values[0]

    if not isinstance(g1, list) or not isinstance(g2, list):
        return False
    if len(g1) == None or len(g2) == None:
        return False

    parents1 = genres.loc[
        genres['genre_title'].isin(g1),
        'genre_parent_id'
    ].dropna()

    parents2 = genres.loc[
        genres['genre_title'].isin(g2),
        'genre_parent_id'
    ].dropna()

    return len(set(parents1) & set(parents2)) > 0


def hasSameGenre(track_id1, track_id2):
    g1 = tracks.loc[tracks['track_id'] == track_id1, 'track_genres'].values[0]
    g2 = tracks.loc[tracks['track_id'] == track_id2, 'track_genres'].values[0]

    if not isinstance(g1, list) or not isinstance(g2, list):
        return False
    if len(g1) == None or len(g2) == None:
        return False

    return len(set(g1) & set(g2)) > 0

def get_explicit_track(track_id):
    explicit = tracks.loc[tracks['track_id'] == track_id, 'track_explicit'].values[0]
    return explicit

def get_explicit_user(user_id):
    explicit = users.loc[users['user_id'] == user_id, 'explicit_ok'].values[0]
    return explicit >= 0

# user explicit : false    ---->  track explicit : false  
# user explicit : true     ---->  track explicit : true/false

def verifie_explicit(user, track_id):
    res = True
    if((get_explicit_user(user) == False) and (get_explicit_track(track_id) != False)):
        res = False
    return res


def echonest_recommend(user, track_id, n, compareGenre): #prend en entrée un id de track et un nombre n qui va correspondre au nombre de tracks recommandés qui vont être renvoyés 
    if(track_id in echonest.keys()): #on vérifie si le track comporte des données echonest
        sim = [] #liste qui va contenir des tuples comrpenant le track_id et la similarité 
        echo = echonest[track_id] #on récupère les données echonest du track prit en entré
        for key in echonest.keys():  #on parcourt tous les tracks d'echonest
            if(key!=track_id): #on vérifie si le track_id en entrée est différent de celui qu'on compare actuellement
                if (verifie_explicit(user, key)): #on regarde si les préférences explicites de l'utilisateur correspondent à celles du track de départ
                    similarity = basicsfunctions.simCos(echo, echonest[key]) #calcul de la similarité avec simCos du fichier basicsfunctions réalisé en TD
                    # on ajoute les similarités des tracks qui font parti du même genre parent que le track de départ
                    if(compareGenre and (hasSameGenre(track_id, key) or hasSameParentGenre(track_id, key))):
                        sim.append((key, similarity))#on ajoute la similarité couplé avec son track_id dans la liste sim
                    elif not compareGenre: #s'il ne veut pas que ce soit du même genre forcément
                        sim.append((key, similarity))

        sim.sort(key=lambda x: x[1], reverse=True)

        if len(sim) < n:
            n = len(sim)
            print("Pas assez de musiques similaires dans la base de données, on en renvoie que", n, file=sys.stderr)

        # cas découverte
        if users.loc[users['user_id'] == user, 'likes_discovery'].values[0] > 2 and n > 1:
            decouverte = sim[-1]
            recommandations = sim[:n-1] + [decouverte]
        else:
            recommandations = sim

        return recommandations[:n]

    else:
        print("Track_id sans données echonest", file=sys.stderr)
        return []


# #test
# #track_id_test = 1052 # musique explicite
# track_id_test = 156031 # musique rajoutée proposée par un utilisateur
# # track_id_test = 4104 # musique non explicite
# user_id_test = 1  # user qui aime les musiques explicites et la découverte
# # user_id_test = 10 # user qui n'aime pas les musiques explicites et la découverte
# simi = echonest_recommend(user_id_test, track_id_test, 5, True)

# #on écupère le titre et l'artiste 
# rows_test = artists_tracks.loc[
#     artists_tracks['track_id'] == track_id_test,
#     ['track_title', 'artist_name']
# ]

# if rows_test.empty:
#     print(f"Musique de départ : Track {track_id_test} - Artiste inconnu")
# else:
#     titre_test = rows_test.iloc[0].tolist()
#     print(f"Musique de départ : {titre_test[0]} - {titre_test[1]}")


# #affichage des titres et artistes des n musiques les plus similaires
# print("\nMusiques recommandées :")
# for couple in simi:
#     track_id = couple[0]
#     similarity = couple[1]
#     titre = artists_tracks.loc[artists_tracks['track_id'] == track_id,['track_title', 'artist_name']].iloc[0].tolist()
#     print(f"{titre[0]} - {titre[1]} (similarity: {similarity})")


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
    
    result = echonest_recommend(user_id, track_id, n, compare_genre)
    
    if not result:
        print(json.dumps([]))
    else:
        track_ids = [int(rec[0]) for rec in result]
        print(json.dumps(track_ids))
