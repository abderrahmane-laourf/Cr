export const initialData = {
  "employees": [
    {
      "id": "1",
      "firstName": "Bernard",
      "lastName": "Anouith",
      "name": "Bernard Anouith",
      "phone": "0662-897654",
      "cin": "J58569",
      "cnss": "55667788",
      "salary": 12000,
      "bank": "Attijari",
      "rib": "111122223333444455556666",
      "project": "Beta",
      "business": "Commit",
      "role": "Admin",
      "active": true,
      "login": "bernard.a",
      "password": "password123",
      "permissions": [
        "dashboard",
        "payments",
        "parcels_view"
      ],
      "avatar": "https://i.pravatar.cc/150?img=33"
    },
    {
      "id": "2",
      "firstName": "Sarah",
      "lastName": "Idrissi",
      "name": "Sarah Idrissi",
      "phone": "0663-445566",
      "cin": "AA98765",
      "cnss": "99887766",
      "salary": 9000,
      "bank": "BMCE",
      "rib": "777788889999000011112222",
      "project": "Alpha",
      "business": "Herboclear",
      "role": "Employé",
      "active": true,
      "login": "sarah.i",
      "password": "password123",
      "permissions": [
        "dashboard"
      ],
      "avatar": "https://i.pravatar.cc/150?img=5"
    },
    {
      "id": "3",
      "firstName": "Fatiha",
      "lastName": "Abassi",
      "name": "Fatiha Abassi",
      "phone": "0663-445566",
      "cin": "AA98765",
      "cnss": "99887766",
      "salary": 9000,
      "bank": "BMCE",
      "rib": "777788889999000011112222",
      "project": "Alpha",
      "business": "Herboclear",
      "role": "Employé",
      "active": true,
      "login": "fatiha.a",
      "password": "password123",
      "permissions": [
        "dashboard"
      ],
      "avatar": "https://i.pravatar.cc/150?img=25"
    },
    {
      "id": "4",
      "firstName": "Khadija",
      "lastName": "El Amrani",
      "name": "Khadija El Amrani",
      "phone": "0661-223344",
      "cin": "BB12345",
      "cnss": "11223344",
      "salary": 7000,
      "bank": "CIH",
      "rib": "222233334444555566667777",
      "project": "Gamma",
      "business": "Commit",
      "role": "confirmation",
      "active": true,
      "login": "khadija.e",
      "password": "password123",
      "permissions": [
        "confirmation"
      ],
      "avatar": "https://i.pravatar.cc/150?img=10"
    },
    {
      "id": "5",
      "firstName": "Mina",
      "lastName": "Benali",
      "name": "Mina Benali",
      "phone": "0662-334455",
      "cin": "CC67890",
      "cnss": "55443322",
      "salary": 7500,
      "bank": "Attijariwafa",
      "rib": "333344445555666677778888",
      "project": "Delta",
      "business": "Herboclear",
      "role": "confirmation",
      "active": true,
      "login": "mina.b",
      "password": "password123",
      "permissions": [
        "confirmation"
      ],
      "avatar": "https://i.pravatar.cc/150?img=9"
    },
    {
      "id": "6",
      "firstName": "Fatima",
      "lastName": "Zahra",
      "name": "Fatima Zahra",
      "phone": "0663-556677",
      "cin": "DD11223",
      "cnss": "66778899",
      "salary": 6500,
      "bank": "BMCI",
      "rib": "444455556666777788889999",
      "project": "Epsilon",
      "business": "Commit",
      "role": "packaging",
      "active": true,
      "login": "fatima.z",
      "password": "password123",
      "permissions": [
        "packaging"
      ],
      "avatar": "https://i.pravatar.cc/150?img=20"
    }
  ],
  "presence": [
    {
      "id": "1",
      "employeeId": 1,
      "date": "2023-12-02",
      "daysAdj": 0,
      "hoursAdj": 2,
      "note": "Heures supplémentaires projet Alpha"
    },
    {
      "id": "2",
      "employeeId": 2,
      "date": "2023-12-01",
      "daysAdj": -1,
      "hoursAdj": 0,
      "note": "Absence injustifiée"
    },
    {
      "id": "3",
      "employeeId": 3,
      "date": "2023-12-03",
      "daysAdj": 0,
      "hoursAdj": -2,
      "note": "Retard matin"
    },
    {
      "id": "4",
      "employeeId": 1,
      "date": "2023-11-15",
      "daysAdj": 1,
      "hoursAdj": 0,
      "note": "Jour férié travaillé"
    },
    {
      "id": "e182",
      "employeeId": 1,
      "date": "2025-12-03",
      "daysAdj": 0,
      "hoursAdj": 0,
      "note": ""
    },
    {
      "id": "8f2f",
      "employeeId": 1,
      "date": "2025-12-03",
      "daysAdj": 2,
      "hoursAdj": -1,
      "note": "mrid"
    },
    {
      "id": "831b",
      "employeeId": 1,
      "date": "2025-12-03",
      "daysAdj": 12,
      "hoursAdj": -122,
      "note": "azdazd"
    },
    {
      "id": "1092",
      "employeeId": 1,
      "date": "2025-12-03",
      "daysAdj": -12,
      "hoursAdj": -12,
      "note": "acaz"
    },
    {
      "id": "4cf1",
      "employeeId": null,
      "date": "2025-12-03",
      "daysAdj": 12,
      "hoursAdj": -300,
      "note": "lghiyab"
    },
    {
      "id": "a6c2",
      "employeeId": 1,
      "date": "2025-12-03",
      "daysAdj": 120,
      "hoursAdj": 120,
      "note": ""
    }
  ],
  "payments": [
    {
      "id": "101",
      "employeeId": 1,
      "month": "2023-11",
      "date": "2023-11-25",
      "type": "Salaire",
      "basic": 8000,
      "commission": 307.69,
      "deduction": 0,
      "net": 8307.69,
      "method": "Virement",
      "proofUrl": null
    },
    {
      "id": "102",
      "employeeId": 2,
      "month": "2023-11",
      "date": "2023-11-25",
      "type": "Salaire",
      "basic": 12000,
      "commission": 0,
      "deduction": 461.54,
      "net": 11538.46,
      "method": "Virement",
      "proofUrl": null
    },
    {
      "id": "103",
      "employeeId": 3,
      "month": "2023-11",
      "date": "2023-11-26",
      "type": "Salaire",
      "basic": 9000,
      "commission": 0,
      "deduction": 86.54,
      "net": 8913.46,
      "method": "Virement",
      "proofUrl": null
    },
    {
      "id": "17db",
      "employeeId": 1,
      "month": "2025-12",
      "type": "Avance",
      "basic": 8000,
      "commission": 4307.69,
      "deduction": 4730.77,
      "method": "Virement",
      "proof": null,
      "net": 7576.919999999998,
      "date": "2025-12-03",
      "proofUrl": null
    },
    {
      "id": "2578",
      "employeeId": 1,
      "month": "2025-12",
      "type": "Avance",
      "basic": 12000,
      "commission": 74307.69,
      "deduction": 30634.62,
      "method": "Espèces",
      "proof": null,
      "net": 55673.07000000001,
      "date": "2025-12-03",
      "proofUrl": null
    }
  ],
  "products": [
    {
      "id": "1",
      "nom": "Serum Vitamine C",
      "image": "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=200&h=200&fit=crop",
      "type": "Fabriqué",
      "categorie": "Cosmétique",
      "uniteCalcul": "ml",
      "prixAchat": 45,
      "prix1": 89,
      "prix2": 85,
      "prix3": 80,
      "fragile": true,
      "stock": 145,
      "alerteStock": 20,
      "description": "Sérum anti-âge enrichi en vitamine C pure pour illuminer et raffermir la peau",
      "ingredients": "Aqua, Ascorbic Acid (Vitamin C), Hyaluronic Acid, Glycerin, Ferulic Acid, Vitamin E",
      "modeEmploi": "Appliquer 3-4 gouttes sur le visage propre matin et soir. Masser délicatement jusqu'à absorption complète. Suivre avec une crème hydratante.",
      "utilisationsInterdites": "Ne pas utiliser sur peau irritée ou lésée. Éviter le contour des yeux. Déconseillé aux femmes enceintes sans avis médical.",
      "faq": "Q: Peut-on l'utiliser tous les jours? R: Oui, matin et soir. Q: Convient-il aux peaux sensibles? R: Oui, mais faire un test cutané d'abord.",
      "scriptVente": "Ce sérum révolutionnaire à la vitamine C pure transforme votre peau en seulement 2 semaines! Résultats visibles: teint éclatant, rides réduites, texture affinée."
    },
    {
      "id": "2",
      "nom": "Huile d'Argan Bio",
      "image": "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=200&h=200&fit=crop",
      "type": "Matière Première",
      "categorie": "Cosmétique",
      "uniteCalcul": "ml",
      "prixAchat": 35,
      "prix1": 75,
      "prix2": 70,
      "prix3": 65,
      "fragile": false,
      "stock": 230,
      "alerteStock": 30,
      "description": "Huile d'argan 100% pure et biologique du Maroc, pressée à froid",
      "ingredients": "100% Huile d'Argania Spinosa (Argan) pressée à froid, certifiée biologique",
      "modeEmploi": "Pour le visage: 2-3 gouttes sur peau humide. Pour les cheveux: appliquer sur longueurs et pointes, laisser poser 30 min. Pour le corps: masser sur peau humide après la douche.",
      "utilisationsInterdites": "Usage externe uniquement. Ne pas ingérer. Éviter en cas d'allergie aux fruits à coque.",
      "faq": "Q: Convient-elle aux peaux grasses? R: Oui, elle régule le sébum. Q: Peut-on l'utiliser pure? R: Oui, elle est 100% pure.",
      "scriptVente": "L'or liquide du Maroc! Cette huile précieuse nourrit intensément peau et cheveux. Riche en vitamine E et acides gras essentiels, elle répare et protège naturellement."
    },
    {
      "id": "3",
      "nom": "Crème Hydratante Aloe Vera",
      "image": "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=200&h=200&fit=crop",
      "type": "Fabriqué",
      "categorie": "Cosmétique",
      "uniteCalcul": "ml",
      "prixAchat": 28,
      "prix1": 65,
      "prix2": 60,
      "prix3": 55,
      "fragile": true,
      "stock": 98,
      "alerteStock": 15,
      "description": "Crème hydratante légère à l'aloe vera pour tous types de peaux",
      "ingredients": "Aloe Barbadensis Leaf Juice, Aqua, Glycerin, Shea Butter, Jojoba Oil, Vitamin E, Panthenol",
      "modeEmploi": "Appliquer matin et soir sur visage et cou propres. Masser en mouvements circulaires jusqu'à absorption.",
      "utilisationsInterdites": "Ne pas utiliser en cas d'allergie à l'aloe vera. Éviter le contact avec les yeux.",
      "faq": "Q: Convient-elle aux peaux mixtes? R: Parfaitement, texture légère non grasse. Q: Peut-on l'utiliser sous le maquillage? R: Oui, excellente base.",
      "scriptVente": "Hydratation 24h garantie! Cette crème onctueuse pénètre instantanément sans effet gras. Votre peau reste douce, souple et éclatante toute la journée."
    },
    {
      "id": "4",
      "nom": "Masque Argile Verte",
      "image": "https://images.unsplash.com/photo-1571875257727-256c39da42af?w=200&h=200&fit=crop",
      "type": "Produit Pré",
      "categorie": "Cosmétique",
      "uniteCalcul": "g",
      "prixAchat": 15,
      "prix1": 45,
      "prix2": 42,
      "prix3": 38,
      "fragile": false,
      "stock": 67,
      "alerteStock": 10,
      "description": "Masque purifiant à l'argile verte pour peaux grasses et mixtes",
      "ingredients": "Argile Verte (Montmorillonite), Kaolin, Huile de Tea Tree, Extrait de Menthe, Charbon Actif",
      "modeEmploi": "Appliquer une couche épaisse sur visage propre en évitant le contour des yeux. Laisser poser 10-15 min. Rincer à l'eau tiède. Utiliser 1-2 fois par semaine.",
      "utilisationsInterdites": "Ne pas laisser sécher complètement sur la peau. Ne pas utiliser sur peau très sèche ou irritée. Éviter en cas d'eczéma actif.",
      "faq": "Q: Combien de fois par semaine? R: 1-2 fois maximum. Q: Peut-on l'utiliser sur le corps? R: Oui, idéal pour le dos.",
      "scriptVente": "Le détox ultime pour votre peau! Ce masque absorbe l'excès de sébum, resserre les pores et élimine les impuretés. Résultat: peau nette et matifiée dès la première utilisation!"
    }
  ],
  "productions": [
    {
      "id": "1",
      "date": "2025-12-04",
      "productId": "1",
      "quantity": 50,
      "rawMaterials": [
        {
          "productId": "2",
          "quantity": 10
        }
      ],
      "unitCost": 7,
      "totalCost": 350
    },
    {
      "id": "2",
      "date": "2025-12-03",
      "productId": "3",
      "quantity": 30,
      "rawMaterials": [
        {
          "productId": "2",
          "quantity": 5
        }
      ],
      "unitCost": 5.83,
      "totalCost": 175
    }
  ],
  "warehouses": [
    {
      "id": "1",
      "name": "Magasin Central",
      "location": "Casablanca Centre"
    },
    {
      "id": "2",
      "name": "Dépôt A",
      "location": "Ain Sebaa"
    },
    {
      "id": "3",
      "name": "Dépôt B",
      "location": "Sidi Moumen"
    }
  ],
  "stockMovements": [
    {
      "id": "1",
      "productId": "1",
      "productName": "Serum Vitamine C",
      "type": "Sortie",
      "reason": "Vente hors-site",
      "quantity": -5,
      "warehouse": "Magasin Central",
      "date": "2025-12-01",
      "userId": "1",
      "userName": "Bernard Anouith",
      "userAvatar": "https://i.pravatar.cc/150?img=33",
      "note": "Vente directe client VIP"
    },
    {
      "id": "2",
      "productId": "2",
      "productName": "Argan Oil",
      "type": "Entrée",
      "reason": "Réception Fournisseur",
      "quantity": 50,
      "warehouse": "Dépôt A",
      "date": "2025-12-02",
      "userId": "2",
      "userName": "Sarah Idrissi",
      "userAvatar": "https://i.pravatar.cc/150?img=5",
      "note": "Commande #1234"
    },
    {
      "id": "3",
      "productId": "3",
      "productName": "Crème Hydratante",
      "type": "Sortie",
      "reason": "Cassé / Abimé",
      "quantity": -2,
      "warehouse": "Magasin Central",
      "date": "2025-12-03",
      "userId": "1",
      "userName": "Bernard Anouith",
      "userAvatar": "https://i.pravatar.cc/150?img=33",
      "note": "Emballage endommagé pendant transport"
    },
    {
      "id": "4449",
      "productId": "3",
      "productName": "Crème Hydratante",
      "type": "Sortie",
      "reason": "Transfert vers Dépôt B",
      "quantity": -10,
      "warehouse": "Magasin Central",
      "date": "2025-12-03",
      "userId": "1",
      "userName": "Bernard Anouith",
      "userAvatar": "https://i.pravatar.cc/150?img=33",
      "note": "Transfert #438e"
    },
    {
      "id": "8167",
      "productId": "3",
      "productName": "Crème Hydratante",
      "type": "Entrée",
      "reason": "Transfert depuis Magasin Central",
      "quantity": 10,
      "warehouse": "Dépôt B",
      "date": "2025-12-03",
      "userId": "1",
      "userName": "Bernard Anouith",
      "userAvatar": "https://i.pravatar.cc/150?img=33",
      "note": "Transfert #438e"
    },
    {
      "id": "4dc3",
      "productId": "4",
      "productName": "Masque Argile",
      "type": "Sortie",
      "reason": "Transfert vers Dépôt B",
      "quantity": -100,
      "warehouse": "Magasin Central",
      "date": "2025-12-03",
      "userId": "1",
      "userName": "Bernard Anouith",
      "userAvatar": "https://i.pravatar.cc/150?img=33",
      "note": "Transfert #dcbe"
    },
    {
      "id": "3987",
      "productId": "4",
      "productName": "Masque Argile",
      "type": "Entrée",
      "reason": "Transfert depuis Magasin Central",
      "quantity": 100,
      "warehouse": "Dépôt B",
      "date": "2025-12-03",
      "userId": "1",
      "userName": "Bernard Anouith",
      "userAvatar": "https://i.pravatar.cc/150?img=33",
      "note": "Transfert #dcbe"
    },
    {
      "id": "8097",
      "productId": "1",
      "productName": "Serum Vitamine C",
      "type": "Sortie",
      "reason": "Transfert vers Magasin Central",
      "quantity": -10,
      "warehouse": "Dépôt A",
      "date": "2025-12-03",
      "userId": "1",
      "userName": "Bernard Anouith",
      "userAvatar": "https://i.pravatar.cc/150?img=33",
      "note": "Transfert #dae7"
    },
    {
      "id": "1808",
      "productId": "1",
      "productName": "Serum Vitamine C",
      "type": "Entrée",
      "reason": "Transfert depuis Dépôt A",
      "quantity": 10,
      "warehouse": "Magasin Central",
      "date": "2025-12-03",
      "userId": "1",
      "userName": "Bernard Anouith",
      "userAvatar": "https://i.pravatar.cc/150?img=33",
      "note": "Transfert #dae7"
    }
  ],
  "stockTransfers": [
    {
      "id": "1",
      "productId": "1",
      "productName": "Serum Vitamine C",
      "quantity": 10,
      "sourceWarehouse": "Magasin Central",
      "destinationWarehouse": "Dépôt A",
      "date": "2025-11-28",
      "userId": "1",
      "userName": "Bernard Anouith"
    },
    {
      "id": "2",
      "productId": "2",
      "productName": "Argan Oil",
      "quantity": 25,
      "sourceWarehouse": "Dépôt A",
      "destinationWarehouse": "Magasin Central",
      "date": "2025-11-30",
      "userId": "2",
      "userName": "Sarah Idrissi"
    },
    {
      "id": "3",
      "productId": "4",
      "productName": "Masque Argile",
      "quantity": 15,
      "sourceWarehouse": "Magasin Central",
      "destinationWarehouse": "Dépôt B",
      "date": "2025-12-03",
      "userId": "1",
      "userName": "Bernard Anouith"
    },
    {
      "id": "b566",
      "date": "2025-12-03",
      "productId": "1",
      "quantity": 122,
      "sourceWarehouse": "Dépôt A",
      "destinationWarehouse": "Magasin Central",
      "productName": "Serum Vitamine C",
      "userId": "1",
      "userName": "Bernard Anouith"
    },
    {
      "id": "438e",
      "date": "2025-12-03",
      "productId": "3",
      "quantity": 10,
      "sourceWarehouse": "Magasin Central",
      "destinationWarehouse": "Dépôt B",
      "productName": "Crème Hydratante",
      "userId": "1",
      "userName": "Bernard Anouith"
    },
    {
      "id": "dcbe",
      "date": "2025-12-03",
      "productId": "4",
      "quantity": 100,
      "sourceWarehouse": "Magasin Central",
      "destinationWarehouse": "Dépôt B",
      "productName": "Masque Argile",
      "userId": "1",
      "userName": "Bernard Anouith"
    },
    {
      "id": "dae7",
      "date": "2025-12-03",
      "productId": "1",
      "quantity": 10,
      "sourceWarehouse": "Dépôt A",
      "destinationWarehouse": "Magasin Central",
      "productName": "Serum Vitamine C",
      "userId": "1",
      "userName": "Bernard Anouith"
    }
  ],
  "clients": [
    {
      "id": "1",
      "nom": "Ahmed Benali",
      "tel": "0661234567",
      "ville": "1",
      "villeName": "Casablanca",
      "quartier": "1",
      "quartierName": "Maarif",
      "adresse": "Rue 12, Immeuble 5, Apt 3",
      "price": 450,
      "produitId": "1",
      "produitName": "Serum Vitamine C",
      "commentaire": "Client régulier, préfère livraison le matin",
      "nbPiece": 2,
      "stage": "Livré",
      "employeeName": "Khadija El Amrani",
      "business": "Commit",
      "dateReport": null,
      "dateCreated": "2025-12-04T10:30:00",
      "dateModified": "2025-12-04T15:17:40.261Z"
    },
    {
      "id": "2",
      "nom": "Fatima Zahra",
      "tel": "0662345678",
      "ville": "1",
      "villeName": "Casablanca",
      "quartier": "2",
      "quartierName": "Ain Diab",
      "adresse": "Boulevard de la Corniche",
      "price": 350,
      "produitId": "2",
      "produitName": "Huile d'Argan Bio",
      "commentaire": "",
      "nbPiece": 1,
      "stage": "Confirmé",
      "employeeName": "Khadija El Amrani",
      "business": "Commit",
      "dateReport": null,
      "dateCreated": "2025-12-05T14:20:00",
      "dateModified": "2025-12-05T14:20:00"
    },
    {
      "id": "3",
      "nom": "Mohammed Alami",
      "tel": "0663456789",
      "ville": "2",
      "villeName": "Rabat",
      "quartier": "9",
      "quartierName": "Agdal",
      "adresse": "Avenue Hassan II",
      "price": 280,
      "produitId": "3",
      "produitName": "Crème Hydratante Aloe Vera",
      "commentaire": "Appeler après 18h",
      "nbPiece": 1,
      "stage": "Reporter",
      "employeeName": "Khadija El Amrani",
      "business": "Commit",
      "dateReport": "2025-12-07T18:00:00",
      "dateCreated": "2025-12-05T09:15:00",
      "dateModified": "2025-12-05T09:15:00"
    },
    {
      "id": "4",
      "nom": "Samira Bennani",
      "tel": "0664567890",
      "ville": "1",
      "villeName": "Casablanca",
      "quartier": "3",
      "quartierName": "Anfa",
      "adresse": "Rue des Roses",
      "price": 520,
      "produitId": "1",
      "produitName": "Serum Vitamine C",
      "commentaire": "Cliente VIP",
      "nbPiece": 3,
      "stage": "Livré",
      "employeeName": "Mina Benali",
      "business": "Herboclear",
      "dateReport": null,
      "dateCreated": "2025-12-03T11:00:00",
      "dateModified": "2025-12-04T16:30:00"
    },
    {
      "id": "5",
      "nom": "Youssef Tazi",
      "tel": "0665678901",
      "ville": "3",
      "villeName": "Marrakech",
      "quartier": "15",
      "quartierName": "Guéliz",
      "adresse": "Place Abdel Moumen",
      "price": 390,
      "produitId": "4",
      "produitName": "Masque Argile Verte",
      "commentaire": "",
      "nbPiece": 2,
      "stage": "Confirmé",
      "employeeName": "Mina Benali",
      "business": "Herboclear",
      "dateReport": null,
      "dateCreated": "2025-12-05T16:45:00",
      "dateModified": "2025-12-05T16:45:00"
    },
    {
      "id": "6",
      "nom": "Laila Mansouri",
      "tel": "0666789012",
      "ville": "1",
      "villeName": "Casablanca",
      "quartier": "1",
      "quartierName": "Maarif",
      "adresse": "Rue Abou Bakr",
      "price": 450,
      "produitId": "1",
      "produitName": "Serum Vitamine C",
      "commentaire": "Livraison rapide SVP",
      "nbPiece": 2,
      "stage": "Livré",
      "employeeName": "Khadija El Amrani",
      "business": "Commit",
      "dateReport": null,
      "dateCreated": "2025-12-02T08:30:00",
      "dateModified": "2025-12-03T10:15:00"
    },
    {
      "id": "7",
      "nom": "Rachid Benjelloun",
      "tel": "0667890123",
      "ville": "2",
      "villeName": "Rabat",
      "quartier": "10",
      "quartierName": "Hassan",
      "adresse": "Avenue Mohammed V",
      "price": 310,
      "produitId": "2",
      "produitName": "Huile d'Argan Bio",
      "commentaire": "",
      "nbPiece": 1,
      "stage": "Livré",
      "employeeName": "Mina Benali",
      "business": "Herboclear",
      "dateReport": null,
      "dateCreated": "2025-12-01T13:20:00",
      "dateModified": "2025-12-02T09:45:00"
    },
    {
      "id": "8",
      "nom": "Nadia Chraibi",
      "tel": "0668901234",
      "ville": "1",
      "villeName": "Casablanca",
      "quartier": "4",
      "quartierName": "Hay Hassani",
      "adresse": "Quartier Industriel",
      "price": 280,
      "produitId": "3",
      "produitName": "Crème Hydratante Aloe Vera",
      "commentaire": "Ne pas appeler avant 14h",
      "nbPiece": 1,
      "stage": "Reporter",
      "employeeName": "Mina Benali",
      "business": "Herboclear",
      "dateReport": "2025-12-08T14:00:00",
      "dateCreated": "2025-12-05T10:00:00",
      "dateModified": "2025-12-05T10:00:00"
    }
  ],
  "villes": [
    {
      "id": "1",
      "name": "Casablanca"
    },
    {
      "id": "2",
      "name": "Rabat"
    },
    {
      "id": "3",
      "name": "Marrakech"
    },
    {
      "id": "4",
      "name": "Fès"
    },
    {
      "id": "5",
      "name": "Tanger"
    },
    {
      "id": "6",
      "name": "Agadir"
    },
    {
      "id": "7",
      "name": "Meknès"
    },
    {
      "id": "8",
      "name": "Oujda"
    },
    {
      "id": "9",
      "name": "Kenitra"
    },
    {
      "id": "10",
      "name": "Tétouan"
    },
    {
      "id": "11",
      "name": "Safi"
    },
    {
      "id": "12",
      "name": "El Jadida"
    }
  ],
  "quartiers": [
    {
      "id": "1",
      "villeId": "1",
      "name": "Maarif"
    },
    {
      "id": "2",
      "villeId": "1",
      "name": "Ain Diab"
    },
    {
      "id": "3",
      "villeId": "1",
      "name": "Anfa"
    },
    {
      "id": "4",
      "villeId": "1",
      "name": "Hay Hassani"
    },
    {
      "id": "5",
      "villeId": "1",
      "name": "Sidi Moumen"
    },
    {
      "id": "6",
      "villeId": "1",
      "name": "Ain Sebaa"
    },
    {
      "id": "7",
      "villeId": "1",
      "name": "Derb Sultan"
    },
    {
      "id": "8",
      "villeId": "1",
      "name": "Bourgogne"
    },
    {
      "id": "9",
      "villeId": "2",
      "name": "Agdal"
    },
    {
      "id": "10",
      "villeId": "2",
      "name": "Hassan"
    },
    {
      "id": "11",
      "villeId": "2",
      "name": "Hay Riad"
    },
    {
      "id": "12",
      "villeId": "2",
      "name": "Souissi"
    },
    {
      "id": "13",
      "villeId": "2",
      "name": "Yacoub El Mansour"
    },
    {
      "id": "14",
      "villeId": "2",
      "name": "Océan"
    },
    {
      "id": "15",
      "villeId": "3",
      "name": "Guéliz"
    },
    {
      "id": "16",
      "villeId": "3",
      "name": "Médina"
    },
    {
      "id": "17",
      "villeId": "3",
      "name": "Hivernage"
    },
    {
      "id": "18",
      "villeId": "3",
      "name": "Palmeraie"
    },
    {
      "id": "19",
      "villeId": "3",
      "name": "Targa"
    },
    {
      "id": "20",
      "villeId": "4",
      "name": "Médina"
    },
    {
      "id": "21",
      "villeId": "4",
      "name": "Ville Nouvelle"
    },
    {
      "id": "22",
      "villeId": "4",
      "name": "Zouagha"
    },
    {
      "id": "23",
      "villeId": "4",
      "name": "Bensouda"
    },
    {
      "id": "24",
      "villeId": "5",
      "name": "Malabata"
    },
    {
      "id": "25",
      "villeId": "5",
      "name": "Médina"
    },
    {
      "id": "26",
      "villeId": "5",
      "name": "Ville Nouvelle"
    },
    {
      "id": "27",
      "villeId": "5",
      "name": "Boubana"
    },
    {
      "id": "28",
      "villeId": "6",
      "name": "Talborjt"
    },
    {
      "id": "29",
      "villeId": "6",
      "name": "Charaf"
    },
    {
      "id": "30",
      "villeId": "6",
      "name": "Founty"
    }
  ],
  "losses": [
    {
      "id": "1765011474206",
      "date": "2025-12-06",
      "productId": "3",
      "quantity": 120,
      "reason": "zad",
      "productName": "Crème Hydratante Aloe Vera",
      "dateRecorded": "2025-12-06T08:57:54.206Z"
    },
    {
      "id": "1765011969865",
      "date": "2025-12-06",
      "productId": "1",
      "employeeId": "2",
      "quantity": 4,
      "reason": "azd",
      "productName": "Serum Vitamine C",
      "employeeName": "Sarah Idrissi",
      "dateRecorded": "2025-12-06T09:06:09.865Z"
    }
  ],
  "ads": [
    {
      "id": "2",
      "date": "2025-12-03",
      "platform": "TikTok",
      "project": "Alpha",
      "productId": "2",
      "productName": "Huile d'Argan Bio",
      "campaignName": "Campagne Argan Bio - Hiver 2025",
      "goal": "Sales",
      "employeeId": "2",
      "employeeName": "Sarah Idrissi",
      "whatsappNumber": "0663-445566",
      "dailyBudget": 100,
      "orders": 60,
      "spent": 750,
      "cpo": 12.5,
      "dateCreated": "2025-12-03T14:30:00.000Z"
    },
    {
      "id": "3",
      "date": "2025-12-05",
      "platform": "Instagram",
      "project": "Alpha",
      "productId": "3",
      "productName": "Crème Hydratante Aloe Vera",
      "campaignName": "Promo Crème Hydratante",
      "goal": "Message",
      "employeeId": "1",
      "employeeName": "Bernard Anouith",
      "whatsappNumber": "0662-897654",
      "dailyBudget": 50,
      "orders": 35,
      "spent": 280,
      "cpo": 8,
      "dateCreated": "2025-12-05T09:15:00.000Z"
    }
  ],
  "tasks": [
    {
      "id": "1",
      "employeeId": "1",
      "employeeName": "Bernard Anouith",
      "startDate": "2025-12-10",
      "description": "Préparer le rapport mensuel des ventes",
      "duration": 2,
      "status": "In Progress",
      "dateCreated": "2025-12-06T10:00:00.000Z"
    },
     {
      "id": "2",
      "employeeId": "2",
      "employeeName": "Sarah Idrissi",
      "startDate": "2025-12-12",
      "description": "Mise à jour du catalogue produit sur le site web",
      "duration": 5,
      "status": "Pending",
      "dateCreated": "2025-12-06T11:00:00.000Z"
    }
  ]
};
