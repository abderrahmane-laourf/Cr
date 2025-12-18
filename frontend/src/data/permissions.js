export const PERMISSIONS_CONFIG = [
  {
    category: "Tableau de Bord",
    subCategories: [
      {
        name: "Vue d'ensemble",
        permissions: [
          { id: "dashboard_view", label: "Voir le tableau de bord" },
          { id: "dashboard_stats", label: "Voir les statistiques globales" }
        ]
      }
    ]
  },
  {
    category: "Gestion des Employés",
    subCategories: [
      {
        name: "Employés",
        permissions: [
          { id: "employees_view", label: "Voir la liste des employés" },
          { id: "employees_create", label: "Ajouter un employé" },
          { id: "employees_edit", label: "Modifier un employé" },
          { id: "employees_delete", label: "Supprimer un employé" },
          { id: "employees_permissions", label: "Gérer les permissions" }
        ]
      },
      {
        name: "Présence",
        permissions: [
          { id: "presence_view", label: "Voir les présences" },
          { id: "presence_mark", label: "Marquer la présence" },
          { id: "presence_edit", label: "Modifier la présence" }
        ]
      },
      {
        name: "Paiments",
        permissions: [
          { id: "payments_view", label: "Voir les paiements" },
          { id: "payments_create", label: "Créer un paiement" }
        ]
      }
    ]
  },
  {
    category: "Gestion Commerciale",
    subCategories: [
      {
        name: "Clients",
        permissions: [
          { id: "clients_view", label: "Voir les clients" },
          { id: "clients_create", label: "Ajouter un client" },
          { id: "clients_edit", label: "Modifier un client" },
          { id: "clients_delete", label: "Supprimer un client" }
        ]
      },
      {
        name: "Commandes",
        permissions: [
          { id: "orders_view", label: "Voir les commandes" },
          { id: "orders_process", label: "Traiter les commandes" }
        ]
      },
      {
        name: "Pipeline",
        permissions: [
          { id: "pipeline_view", label: "Voir le pipeline" },
          { id: "pipeline_manage", label: "Gérer le pipeline" }
        ]
      }
    ]
  },
  {
    category: "Stock & Produits",
    subCategories: [
      {
        name: "Produits",
        permissions: [
          { id: "products_view", label: "Voir les produits" },
          { id: "products_create", label: "Ajouter un produit" },
          { id: "products_edit", label: "Modifier un produit" },
          { id: "products_delete", label: "Supprimer un produit" }
        ]
      },
      {
        name: "Inventaire",
        permissions: [
          { id: "inventory_view", label: "Voir l'inventaire" },
          { id: "inventory_adjust", label: "Ajuster le stock" }
        ]
      }
    ]
  },
  {
    category: "Confirmation",
    subCategories: [
      {
        name: "Gestion Colis",
        permissions: [
          { id: "confirmation_view", label: "Voir le tableau de bord" },
          { id: "confirmation_add", label: "Ajouter un colis" },
          { id: "confirmation_move", label: "Changer statut (Reporter/Confirmé)" },
          { id: "confirmation_tracking", label: "Voir le suivi" }
        ]
      },
      {
        name: "Versements",
        permissions: [
          { id: "settlements_view", label: "Voir les versements" },
          { id: "settlements_approve", label: "Approuver les versements" },
          { id: "settlements_reject", label: "Rejeter les versements" }
        ]
      }
    ]
  },
  {
    category: "Rôles & Accès",
    subCategories: [
      {
        name: "Gestion Globale",
        permissions: [
          { id: "roles_manage", label: "Gérer les permissions des rôles" },
          { id: "access_all", label: "Accès Super Admin" }
        ]
      }
    ]
  },

  {
    category: "Paramètres",
    subCategories: [
      {
        name: "Configuration",
        permissions: [
          { id: "settings_view", label: "Voir les paramètres" },
          { id: "settings_edit", label: "Modifier les paramètres" },
          { id: "business_manage", label: "Gérer les entreprises" }
        ]
      }
    ]
  }
];

// Helper to get all permission IDs
export const getAllPermissionIds = () => {
  const ids = [];
  PERMISSIONS_CONFIG.forEach(cat => {
    cat.subCategories.forEach(sub => {
      sub.permissions.forEach(p => ids.push(p.id));
    });
  });
  return ids;
};
