# Interface pour la démo de chaque algorithme de recommandation
import psycopg2
import load
import reco_user_based_p1
import reco_user_based_p2
import reco_user_based_p3
import reco_steph_echonest
import reco_item_based_matheo
import reco_item_based_mathieu
import hybride


def connection_db():
    return psycopg2.connect(
        dbname="InTheEnd_DB",
        user="InTheEnd_User",
        password="InTheEnd_Password",
        host="localhost",
        port="25000"
    )

def afficher_menu():
    """Affiche le menu principal"""
    print("-"*60)
    print("[1] Recommandation User-Based (Part 1)")
    print("[2] Recommandation User-Based (Part 2)")
    print("[3] Recommandation User-Based (Part 3)")
    print("[4] Recommandation Item-Based (Echonest Stéphane)")
    print("[5] Recommandation Item-Based (Mathéo)")
    print("[6] Recommandation Item-Based (Mathieu)")
    print("[7] Recommandation Hybride")
    print("[0] Quitter")
    print("-"*60)

def test_user_based_p1(conn):
    """Test de l'algorithme user-based basé sur le profil"""
    print("\n" + "="*60)
    print("RECOMMANDATION USER-BASED - PART 1 (Profil)")
    print("="*60)
    
    user_id = input("\nEntrez l'ID de l'utilisateur: ")
    try:
        user_id = int(user_id)
    except ValueError:
        print("ID invalide!")
        return

    top_k = input("Nombre de recommandations (défaut: 10): ")
    top_k = int(top_k) if top_k else 10

    print(f"\nConstruction du profil utilisateur {user_id} et génération des recommandations...")

    cursor = conn.cursor()
    try:
        # Charger les données utilisateurs depuis la BDD
        users_df = reco_user_based_p1.pull_data_user(cursor)

        # Vérifier que l'utilisateur existe
        if user_id not in users_df["user_id"].values:
            print(f"Aucun utilisateur trouvé avec l'ID {user_id}")
            return

        # Récupérer les données de l'utilisateur et compléter les valeurs manquantes
        new_user = users_df[users_df["user_id"] == user_id].iloc[0].to_dict()
        completed_user = reco_user_based_p1.complete_user(
            new_user,
            users_df,
            reco_user_based_p1.numeric_cols,
            reco_user_based_p1.categorical_cols,
            reco_user_based_p1.multilabel_cols,
        )

        # Afficher le profil utilisateur complété
        reco_user_based_p1.afficher_user(completed_user)

        # Obtenir et afficher les recommandations
        tracks = reco_user_based_p1.tracks_recommendation(cursor, completed_user)

        if not tracks:
            print("Aucune recommandation disponible")
            return

        tracks = tracks[:top_k]

        print(f"\nTop {len(tracks)} recommandations:")
        print("-"*60)
        for i, track in enumerate(tracks, 1):
            track_id, track_title, artist_name = track
            print(f"{i}. [{track_id}] {track_title} - {artist_name}")

    except Exception as e:
        print(f"Erreur: {e}")
    finally:
        cursor.close()

def test_user_based_p2(conn):
    """Test de l'algorithme user-based basé sur les favoris"""
    print("\n" + "="*60)
    print("RECOMMANDATION USER-BASED - PART 2 (Favoris)")
    print("="*60)
    
    user_id = input("\nEntrez l'ID de l'utilisateur: ")
    try:
        user_id = int(user_id)
    except ValueError:
        print("ID invalide!")
        return
    
    top_k = input("Nombre de recommandations (défaut: 10): ")
    top_k = int(top_k) if top_k else 10
    
    threshold = input("Seuil de similarité (défaut: 0.1): ")
    threshold = float(threshold) if threshold else 0.1
    
    print(f"\nRecherche d'utilisateurs similaires pour l'utilisateur {user_id}...")
    
    try:
        # Charger les données
        all_users_df = load.load_users()
        tracks_df = load.load_tracks()
        
        # Trouver des utilisateurs similaires
        similar_users = reco_user_based_p2.find_similar_users_by_favorites(
            user_id, all_users_df, conn, similarity_threshold=threshold
        )
        
        if not similar_users:
            print(f"Aucun utilisateur similaire trouvé (peut-être que l'utilisateur n'a pas de favoris)")
            return
        
        print(f"{len(similar_users)} utilisateurs similaires trouvés")
        
        # Obtenir des recommandations
        recommendations = reco_user_based_p2.recommend_based_on_similar_users(
            user_id, similar_users, tracks_df, get_title=True, top_k=top_k
        )
        
        if not recommendations:
            print("Aucune recommandation disponible")
            return
        
        print(f"\nTop {len(recommendations)} recommandations:")
        print("-"*60)
        for i, (track_id, track_title, artist_name, score) in enumerate(recommendations, 1):
            print(f"{i}. [{track_id}] {track_title} - {artist_name} | Score: {score:.4f}")
        
    except Exception as e:
        print(f"Erreur: {e}")

def test_user_based_p3():
    """Test de l'algorithme user-based partie 3 (prédiction d'une note pour une track donnée)"""
    print("\n" + "="*60)
    print("RECOMMANDATION USER-BASED - PART 3 (Prédiction sur une track)")
    print("="*60)

    user_id = input("\nEntrez l'ID de l'utilisateur: ")
    track_id = input("Entrez l'ID de la track: ")

    try:
        user_id = int(user_id)
        track_id = int(track_id)
    except ValueError:
        print("ID invalide!")
        return

    print(f"\nCalcul de la prédiction pour l'utilisateur {user_id} sur la track {track_id}...")

    try:
        prediction = reco_user_based_p3.get_pred_for_user(user_id, track_id)
        print("\nRésultat:")
        print("-"*60)
        print(f"Score prédit: {prediction:.4f}")
    except Exception as e:
        print(f"Erreur: {e}")

def test_item_based_echonest():
    """Test de l'algorithme item-based Echonest (Stéphane)"""
    print("\n" + "="*60)
    print("RECOMMANDATION ITEM-BASED - ECHONEST (Stéphane)")
    print("="*60)

    user_id = input("\nEntrez l'ID de l'utilisateur: ")
    track_id = input("Entrez l'ID de la track de départ: ")
    n = input("Nombre de recommandations (défaut: 10): ")
    compare_genre = input("Limiter au même genre? (o/N): ")

    try:
        user_id = int(user_id)
        track_id = int(track_id)
        n = int(n) if n else 10
    except ValueError:
        print("ID ou nombre invalide!")
        return

    compare_genre_bool = compare_genre.strip().lower() == "o"

    print(f"\nRecherche de tracks similaires à {track_id} pour l'utilisateur {user_id}...")

    try:
        recs = reco_steph_echonest.echonest_recommend(user_id, track_id, n, compare_genre_bool)

        if not recs:
            print("Aucune recommandation disponible")
            return

        # afficher les titres/artistes si disponibles via le DataFrame artists_tracks
        artists_tracks = reco_steph_echonest.artists_tracks

        print(f"\nTop {len(recs)} recommandations:")
        print("-"*60)
        for i, (rec_track_id, similarity) in enumerate(recs, 1):
            titre_artiste = artists_tracks.loc[
                artists_tracks['track_id'] == rec_track_id,
                ['track_title', 'artist_name']
            ]
            if not titre_artiste.empty:
                track_title, artist_name = titre_artiste.iloc[0].tolist()
                print(f"{i}. [{rec_track_id}] {track_title} - {artist_name} | Sim: {similarity:.4f}")
            else:
                print(f"{i}. [{rec_track_id}] (titre inconnu) | Sim: {similarity:.4f}")

    except Exception as e:
        print(f"Erreur: {e}")

def test_item_based_matheo():
    """Test de l'algorithme item-based (Mathéo)"""
    print("\n" + "="*60)
    print("RECOMMANDATION ITEM-BASED - MATHÉO")
    print("="*60)

    track_id = input("\nEntrez l'ID de la track de départ: ")
    mode = input("Choix du mode [1] Artiste, [2] Album, [3] Les deux: ")

    try:
        track_id = int(track_id)
    except ValueError:
        print("ID invalide!")
        return

    if mode not in {"1", "2", "3"}:
        print("Mode invalide! Choisissez 1, 2 ou 3.")
        return

    print(f"\nCalcul des recommandations pour la track {track_id} (mode {mode})...")

    try:
        df_complet = reco_item_based_matheo.init()
        reco_item_based_matheo.recommandation_artiste_album(df_complet, track_id, mode)
    except Exception as e:
        print(f"Erreur: {e}")

def test_item_based_mathieu():
    """Test de l'algorithme item-based (Mathieu)"""
    print("\n" + "="*60)
    print("RECOMMANDATION ITEM-BASED - MATHIEU")
    print("="*60)

    track_id = input("\nEntrez l'ID de la track de départ: ")
    n = input("Nombre de recommandations (défaut: 10): ")
    seuil = input("Seuil de similarité (défaut: 0.4): ")
    ratio = input("Ratio similaires/découvertes (0-1, défaut: 0.8): ")

    try:
        track_id = int(track_id)
        n = int(n) if n else 10
        seuil_sim = float(seuil) if seuil else 0.4
        sim_ratio = float(ratio) if ratio else 0.8
        if not (0.0 <= sim_ratio <= 1.0):
            raise ValueError
    except ValueError:
        print("Paramètres invalides (IDs/nombres/ratio).")
        return

    print(f"\nCalcul des recommandations pour la track {track_id}...")

    try:
        df_tracks = reco_item_based_mathieu.tracks
        cosine_sim = reco_item_based_mathieu.m
        indices = reco_item_based_mathieu.indices

        recos_df = reco_item_based_mathieu.recommendation_id(
            track_id, df_tracks, cosine_sim, indices, sim_ratio, seuil_sim, n
        )

        if recos_df is None or getattr(recos_df, 'empty', True):
            print("Aucune recommandation trouvée.")
            return

        print(f"\nTop {len(recos_df)} recommandations:")
        print("-"*60)
        for i, row in enumerate(recos_df.itertuples(index=False), 1):
            title = getattr(row, 'track_title', 'Titre inconnu')
            listens = getattr(row, 'track_listens', 'N/A')
            genres = getattr(row, 'track_genres', [])
            score = getattr(row, 'score_similarite', None)
            genres_str = ", ".join(genres) if isinstance(genres, list) else str(genres)
            score_str = f" | Sim: {score:.4f}" if isinstance(score, (float, int)) else ""
            print(f"{i}. {title} | Ecoutes: {listens} | Genres: {genres_str}{score_str}")

    except Exception as e:
        print(f"Erreur: {e}")

def test_hybrid_recommendation():
    """Test de l'algorithme hybride (user-based + item-based)"""
    print("\n" + "="*60)
    print("RECOMMANDATION HYBRIDE (User + Item)")
    print("="*60)

    user_id = input("\nEntrez l'ID de l'utilisateur: ")
    track_id = input("Entrez l'ID de la track de départ (pour item-based): ")
    n = input("Nombre de recommandations item-based (défaut: 10): ")
    top_k = input("Nombre de recommandations user-based (défaut: 10): ")
    compare_genre = input("Limiter item-based au même genre? (o/N): ")

    try:
        user_id = int(user_id)
        track_id = int(track_id)
        n = int(n) if n else 10
        top_k = int(top_k) if top_k else 10
    except ValueError:
        print("Paramètres invalides (IDs/nombres).")
        return

    compare_genre_bool = compare_genre.strip().lower() == "o"

    print(f"\nMélange des approches pour l'utilisateur {user_id}...")

    try:
        # Appel de la recommandation hybride
        rec_ids = hybride.hybride_recommendation(
            track_id=track_id,
            n=n,
            compareGenre=compare_genre_bool,
            target_user_id=user_id,
            get_title=True,
            top_k=top_k,
        )

        if not rec_ids:
            print("Aucune recommandation hybride trouvée.")
            return

        # Afficher les titres/artistes si disponibles
        artists_tracks = getattr(reco_steph_echonest, 'artists_tracks', None)

        print(f"\nTop {len(rec_ids)} recommandations hybrides:")
        print("-"*60)
        for i, rec_track_id in enumerate(rec_ids, 1):
            if artists_tracks is not None:
                row = artists_tracks.loc[
                    artists_tracks['track_id'] == rec_track_id,
                    ['track_title', 'artist_name']
                ]
                if not row.empty:
                    title, artist = row.iloc[0].tolist()
                    print(f"{i}. [{rec_track_id}] {title} - {artist}")
                    continue
            print(f"{i}. [{rec_track_id}] (titre inconnu)")

    except Exception as e:
        print(f"Erreur: {e}")

def main():
    """Fonction principale"""
    conn = connection_db()
        
    while True:
        afficher_menu()
        choix = input("\nChoisissez une option: ")
        
        if choix == "1":
            test_user_based_p1(conn)
        elif choix == "2":
            test_user_based_p2(conn)
        elif choix == "3":
            test_user_based_p3()
        elif choix == "4":
            test_item_based_echonest()
        elif choix == "5":
            test_item_based_matheo()
        elif choix == "6":
            test_item_based_mathieu()
        elif choix == "7":
            test_hybrid_recommendation()
        elif choix == "0":
            print("\nAu revoir!")
            break
        else:
            print("\nOption invalide!")
        
        input("\nAppuyez sur Entrée pour continuer...")
    
    conn.close()

if __name__ == "__main__":
    main()
