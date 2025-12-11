# Système de Gestion des Commissions

## Vue d'ensemble

Le système de gestion des commissions permet de définir des commissions personnalisées pour chaque employé sur chaque produit, avec trois niveaux de prix différents.

## Fonctionnalités principales

### 1. Sélection d'employé
- Liste déroulante de tous les employés
- Affichage du rôle de l'employé
- Chargement automatique du tableau des commissions

### 2. Application en masse (Bulk Apply) ⭐
**Fonctionnalité clé pour gagner du temps**

Au lieu de saisir manuellement les commissions pour chaque produit :
- Entrez les valeurs de commission pour les 3 niveaux de prix
- Cliquez sur "تطبيق على الجميع" (Appliquer à tous)
- Les valeurs sont appliquées instantanément à tous les produits

**Exemple d'utilisation :**
- Prix 1 (Low) : 10 DH
- Prix 2 (Mid) : 25 DH  
- Prix 3 (High) : 40 DH

→ Tous les produits auront ces commissions

### 3. Tableau détaillé
Pour chaque produit :
- **Nom et catégorie** du produit
- **3 colonnes de prix** avec :
  - Prix de vente de référence (badge gris)
  - Champ de saisie pour la commission personnalisée

### 4. Sauvegarde
- Bouton flottant en bas de page
- Sauvegarde dans localStorage
- Confirmation visuelle (✅ تم الحفظ)

## Structure des données

### localStorage Keys

#### `sys_commissions`
Structure JSON :
```json
{
  "employeeId": {
    "productId": {
      "c1": "10",
      "c2": "25",
      "c3": "40"
    }
  }
}
```

**Exemple concret :**
```json
{
  "emp-001": {
    "prod-iphone": {
      "c1": "50",
      "c2": "75",
      "c3": "100"
    },
    "prod-charger": {
      "c1": "5",
      "c2": "10",
      "c3": "15"
    }
  },
  "emp-002": {
    "prod-iphone": {
      "c1": "40",
      "c2": "60",
      "c3": "80"
    }
  }
}
```

## Intégration avec le système

### APIs utilisées
- **employeeAPI.getAll()** : Récupère tous les employés
- **productAPI.getAll()** : Récupère tous les produits

### Relation avec les salaires
Les commissions définies ici peuvent être utilisées pour :
1. Calculer les bonus mensuels
2. Ajuster les salaires en fonction des ventes
3. Générer des rapports de performance

### Relation avec la présence
Les commissions peuvent être pondérées par :
- Le nombre de jours travaillés
- Les heures supplémentaires
- Les absences

## Formules de calcul suggérées

### Commission totale mensuelle
```javascript
commissionTotale = Σ (quantitéVendue × commissionProduit)
```

### Salaire final
```javascript
salaireFinal = salaireBase + commissionTotale + (joursSupp × tauxJournalier) - (absences × tauxJournalier)
```

## Guide d'utilisation

### Étape 1 : Sélectionner un employé
1. Cliquez sur la liste déroulante "اختر الموظف"
2. Sélectionnez un employé

### Étape 2 : Définir les commissions

**Option A - Application rapide (recommandé) :**
1. Remplissez les 3 champs de la section "تعيين جماعي سريع"
2. Cliquez sur "تطبيق على الجميع"
3. Toutes les commissions sont appliquées instantanément

**Option B - Saisie manuelle :**
1. Pour chaque produit, entrez la commission dans les 3 colonnes
2. Les valeurs sont mises à jour en temps réel

### Étape 3 : Sauvegarder
1. Cliquez sur "💾 حفظ التغييرات" en bas de page
2. Attendez la confirmation "✅ تم الحفظ"

### Étape 4 : Répéter pour les autres employés
1. Sélectionnez un autre employé
2. Répétez les étapes 2-3

## Cas d'usage

### Cas 1 : Commission uniforme
**Situation :** Tous les produits ont la même structure de commission

**Solution :**
- Utilisez le Bulk Apply
- Entrez : 10 DH / 25 DH / 40 DH
- Appliquez à tous

### Cas 2 : Commissions différenciées
**Situation :** Produits premium ont des commissions plus élevées

**Solution :**
1. Appliquez une base avec Bulk Apply
2. Ajustez manuellement les produits premium

### Cas 3 : Employé spécialisé
**Situation :** Un employé ne vend que certains produits

**Solution :**
- Laissez les autres produits à 0
- Remplissez uniquement ses produits

## Conseils et bonnes pratiques

### ✅ À faire
- Sauvegarder régulièrement
- Utiliser le Bulk Apply pour gagner du temps
- Vérifier les valeurs avant de sauvegarder
- Documenter les changements de politique

### ❌ À éviter
- Oublier de sauvegarder
- Entrer des valeurs négatives
- Modifier sans consulter la direction
- Supprimer les données sans backup

## Dépannage

### Problème : Les données ne se sauvegardent pas
**Solution :** Vérifiez que localStorage est activé dans le navigateur

### Problème : Les valeurs disparaissent
**Solution :** Assurez-vous de cliquer sur "حفظ التغييرات" avant de quitter

### Problème : Le Bulk Apply ne fonctionne pas
**Solution :** Vérifiez qu'au moins un champ est rempli

## Évolutions futures possibles

1. **Export Excel** : Exporter les commissions en fichier Excel
2. **Historique** : Garder un historique des modifications
3. **Calcul automatique** : Intégrer avec les ventes pour calculer les commissions réelles
4. **Approbation** : Système de validation par manager
5. **Templates** : Sauvegarder des modèles de commissions réutilisables

## Support technique

Pour toute question ou problème :
- Consultez ce guide
- Vérifiez la console du navigateur (F12)
- Contactez l'équipe technique

---

**Version :** 1.0  
**Date :** 2025-12-09  
**Auteur :** Système CRM
