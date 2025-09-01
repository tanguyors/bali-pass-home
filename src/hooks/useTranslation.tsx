import { createContext, useContext, useState, ReactNode } from 'react';

interface TranslationContextType {
  language: 'en' | 'fr';
  setLanguage: (lang: 'en' | 'fr') => void;
  t: (key: string) => string;
}

const TranslationContext = createContext<TranslationContextType | undefined>(undefined);

const translations = {
  en: {
    // Navigation
    'nav.home': 'Home',
    'nav.explorer': 'Explorer',
    'nav.community': 'Community',
    'nav.my_pass': 'My Pass',
    'nav.profile': 'Profile',
    'nav.favorites': 'Favorites',
    
    // Common
    'common.loading': 'Loading...',
    'common.search': 'Search',
    'common.filter': 'Filter',
    'common.save': 'Save',
    'common.cancel': 'Cancel',
    'common.confirm': 'Confirm',
    'common.error': 'Error',
    'common.success': 'Success',
    'common.email': 'Email',
    'common.password': 'Password',
    'common.phone': 'Phone',
    'common.name': 'Name',
    'common.learn_more': 'Learn more',
    
    // Auth
    'auth.sign_in': 'Sign In',
    'auth.sign_up': 'Sign Up',
    'auth.create_account': 'Create Account',
    'auth.signing_in': 'Signing In...',
    'auth.creating_account': 'Creating Account...',
    'auth.first_name': 'First Name',
    'auth.last_name': 'Last Name',
    'auth.phone_number': 'Phone Number',
    'auth.birth_date': 'Birth Date',
    'auth.accept_terms': 'I accept the terms',
    'auth.terms_full': 'I have read and accept the Terms of Sale, Terms of Use, Privacy Policy and Refund Policy',
    'auth.password_min': 'Password must be at least 6 characters',
    'auth.must_accept_terms': 'You must accept the terms of use',
    'auth.login_error': 'Login Error',
    'auth.signup_error': 'Sign Up Error',
    'auth.invalid_credentials': 'Invalid email or password',
    'auth.user_exists': 'An account with this email already exists. Try signing in.',
    'auth.signup_success': 'Sign up successful!',
    'auth.verify_email': 'Check your email to confirm your account.',
    'auth.login_success': 'Login successful',
    'auth.welcome': 'Welcome to Bali Pass!',
    'auth.unexpected_error': 'An unexpected error occurred',
    
    // Pass
    'pass.my_pass': 'My Bali Pass',
    'pass.get_pass': 'Get Bali Pass',
    'pass.active': 'Active',
    'pass.inactive': 'Inactive',
    'pass.expired': 'Expired',
    'pass.pending': 'Pending',
    'pass.no_pass': 'No pass',
    'pass.expires_on': 'Expires on',
    'pass.validity': 'Validity',
    'pass.days_remaining': 'days remaining',
    'pass.your_privilege_pass': 'Your privilege pass for Bali',
    'pass.connect_to_access': 'Sign in to access your pass and discover your savings',
    'pass.benefits_included': 'Benefits included',
    'pass.exclusive_discounts': 'Exclusive discounts at 50+ partners',
    'pass.simple_qr_scan': 'Simple QR code scan',
    'pass.valid_12_months': 'Valid for 12 months',
    'pass.support_24_7': '24/7 customer support',
    'pass.discover_offers': 'Discover offers',
    
    // Profile
    'profile.connect': 'Sign In',
    'profile.create_account': 'Create Account',
    'profile.sign_out': 'Sign Out',
    'profile.access_profile': 'Access your profile and manage your Bali Pass preferences',
    'profile.quick_actions': 'Quick Actions',
    'profile.scan_partner': 'Scan Partner',
    'profile.view_offers': 'View Offers',
    'profile.my_savings': 'My Savings',
    'profile.uses': 'uses',
    'profile.recent_activity': 'Recent Activity',
    'profile.no_activity': 'No activity',
    'profile.start_using': 'Start using your pass to see your savings here',
    'profile.personal_info': 'Personal Information',
    'profile.full_name': 'Full Name',
    'profile.language': 'Language',
    'profile.preferences': 'Preferences',
    'profile.push_notifications': 'Push notifications',
    'profile.email_notifications': 'Email notifications',
    'profile.security': 'Security',
    'profile.change_password': 'Change Password',
    'profile.support': 'Support',
    'profile.help_center': 'Help Center',
    'profile.contact_support': 'Contact Support',
    'profile.terms_privacy': 'Terms & Privacy',
    'profile.logout_success': 'Logout successful',
    'profile.see_you_soon': 'See you soon on Bali Pass!',
    'profile.logout_error': 'Unable to sign out',
    'profile.preferences_updated': 'Preferences updated',
    'profile.preferences_saved': 'Your preferences have been saved',
    'profile.preferences_error': 'Unable to save preferences',
    'profile.discover_bali_pass': 'Discover Bali Pass',
    
    // Community
    'community.title': 'Community',
    'community.share_experiences': 'Share your experiences',
    'community.loading': 'Loading community...',
    'community.search_placeholder': 'Search in community...',
    'community.publish': 'Publish',
    'community.top_contributors': 'Top Contributors',
    'community.most_active': 'Most active this week',
    'community.this_week': 'This week',
    'community.expert': 'Expert',
    'community.adventurer': 'Adventurer',
    'community.explorer': 'Explorer',
    'community.posts': 'posts',
    'community.no_contributors': 'No contributors yet',
    'community.no_posts': 'No posts yet',
    'community.be_first': 'Be the first to share your experience and inspire the community!',
    'community.create_post': 'Create a post',
    'community.member': 'Member',
    'community.view_partner': 'View Partner',
    
    // Explorer
    'explorer.offers': 'Offers',
    'explorer.partners': 'Partners',
    'explorer.search_offers': 'Search offers...',
    'explorer.search_partners': 'Search partners...',
    'explorer.no_offers': 'No offers found',
    'explorer.no_partners': 'No partners found',
    'explorer.loading_offers': 'Loading offers...',
    'explorer.loading_partners': 'Loading partners...',
    
    // Favorites
    'favorites.title': 'My Favorites',
    'favorites.no_favorites': 'No favorites yet',
    'favorites.explore_partners': 'Explore Partners',
    'favorites.added_on': 'Added on',
    'favorites.loading_error': 'Unable to load favorites',
    
    // Partner
    'partner.call': 'Call',
    'partner.directions': 'Directions',
    'partner.contact_info': 'Contact Information',
    'partner.address': 'Address',
    'partner.website': 'Website',
    'partner.offers': 'Offers',
    'partner.no_offers': 'No offers available',
    'partner.not_found': 'Partner not found',
    
    // Offers
    'offer.use_offer': 'Use Offer',
    'offer.share': 'Share',
    'offer.favorite': 'Favorite',
    'offer.not_found': 'Offer not found',
    'offer.description': 'Description',
    'offer.conditions': 'Conditions',
    'offer.valid_until': 'Valid until',
    'offer.discount': 'discount',
    'offer.free': 'free',
    
    // Actions
    'action.scan_qr': 'Scan QR code',
    'action.get_directions': 'Get directions',
    'action.call_partner': 'Call partner',
    'action.visit_website': 'Visit website',
    'action.share_offer': 'Share offer',
    'action.add_favorite': 'Add to favorites',
    'action.remove_favorite': 'Remove from favorites',
    
    // Toast messages
    'toast.added_to_favorites': 'Added to favorites',
    'toast.removed_from_favorites': 'Removed from favorites',
    'toast.must_be_logged_in': 'You must be logged in to add favorites',
    'toast.link_copied': 'Link copied to clipboard',
    'toast.share_error': 'Unable to share',
    'toast.scan_qr': 'Scan QR',
    'toast.qr_feature_coming': 'QR scan feature coming soon',
    
    // Footer
    'footer.ready_for_bali': 'Ready to enjoy Bali?',
    'footer.discover_exclusive': 'Discover all exclusive benefits now',
    
    // Hero sections
    'hero.welcome_to_bali': 'Welcome to Bali',
    'hero.privilege_pass': 'Your privilege pass',
    'hero.exclusive_discounts': 'Exclusive discounts at the best places in Bali',
    'hero.get_your_pass': 'Get your pass',
    'hero.welcome_back': 'Welcome back',
    'hero.ready_to_save': 'Ready to save',
    'hero.scan_and_save': 'Scan and save at your favorite partners',
  },
  fr: {
    // Navigation
    'nav.home': 'Accueil',
    'nav.explorer': 'Explorer',
    'nav.community': 'Communauté',
    'nav.my_pass': 'Mon Pass',
    'nav.profile': 'Profil',
    'nav.favorites': 'Favoris',
    
    // Common
    'common.loading': 'Chargement...',
    'common.search': 'Rechercher',
    'common.filter': 'Filtrer',
    'common.save': 'Sauvegarder',
    'common.cancel': 'Annuler',
    'common.confirm': 'Confirmer',
    'common.error': 'Erreur',
    'common.success': 'Succès',
    'common.email': 'Email',
    'common.password': 'Mot de passe',
    'common.phone': 'Téléphone',
    'common.name': 'Nom',
    'common.learn_more': 'En savoir plus',
    
    // Auth
    'auth.sign_in': 'Se connecter',
    'auth.sign_up': 'Créer un compte',
    'auth.create_account': 'Créer un compte',
    'auth.signing_in': 'Connexion...',
    'auth.creating_account': 'Création du compte...',
    'auth.first_name': 'Prénom',
    'auth.last_name': 'Nom',
    'auth.phone_number': 'Numéro de téléphone',
    'auth.birth_date': 'Date de naissance',
    'auth.accept_terms': 'J\'accepte les conditions',
    'auth.terms_full': 'J\'ai lu et j\'accepte les Conditions de vente, Conditions d\'utilisation, Politique de confidentialité et Politique de remboursement',
    'auth.password_min': 'Le mot de passe doit contenir au moins 6 caractères',
    'auth.must_accept_terms': 'Vous devez accepter les conditions d\'utilisation',
    'auth.login_error': 'Erreur de connexion',
    'auth.signup_error': 'Erreur d\'inscription',
    'auth.invalid_credentials': 'Email ou mot de passe incorrect',
    'auth.user_exists': 'Un compte avec cet email existe déjà. Essayez de vous connecter.',
    'auth.signup_success': 'Inscription réussie !',
    'auth.verify_email': 'Vérifiez votre email pour confirmer votre compte.',
    'auth.login_success': 'Connexion réussie',
    'auth.welcome': 'Bienvenue sur Bali\'Pass !',
    'auth.unexpected_error': 'Une erreur inattendue s\'est produite',
    
    // Pass
    'pass.my_pass': 'Mon Bali\'Pass',
    'pass.get_pass': 'Obtenir le Bali\'Pass',
    'pass.active': 'Actif',
    'pass.inactive': 'Inactif',
    'pass.expired': 'Expiré',
    'pass.pending': 'En attente',
    'pass.no_pass': 'Aucun pass',
    'pass.expires_on': 'Expire le',
    'pass.validity': 'Validité',
    'pass.days_remaining': 'jours restants',
    'pass.your_privilege_pass': 'Votre pass privilège pour Bali',
    'pass.connect_to_access': 'Connecte-toi pour accéder à ton pass et découvrir tes économies',
    'pass.benefits_included': 'Avantages inclus',
    'pass.exclusive_discounts': 'Réductions exclusives chez +50 partenaires',
    'pass.simple_qr_scan': 'Scan simple avec QR code',
    'pass.valid_12_months': 'Valable 12 mois',
    'pass.support_24_7': 'Support client 24/7',
    'pass.discover_offers': 'Découvrir les offres',
    
    // Profile
    'profile.connect': 'Se connecter',
    'profile.create_account': 'Créer un compte',
    'profile.sign_out': 'Se déconnecter',
    'profile.access_profile': 'Accède à ton profil et manage tes préférences Bali\'Pass',
    'profile.quick_actions': 'Actions rapides',
    'profile.scan_partner': 'Scanner partenaire',
    'profile.view_offers': 'Voir les offres',
    'profile.my_savings': 'Mes économies',
    'profile.uses': 'utilisations',
    'profile.recent_activity': 'Dernières utilisations',
    'profile.no_activity': 'Aucune utilisation',
    'profile.start_using': 'Commence à utiliser ton pass pour voir tes économies ici',
    'profile.personal_info': 'Informations personnelles',
    'profile.full_name': 'Nom complet',
    'profile.language': 'Langue',
    'profile.preferences': 'Préférences',
    'profile.push_notifications': 'Notifications push',
    'profile.email_notifications': 'Notifications email',
    'profile.security': 'Sécurité',
    'profile.change_password': 'Changer le mot de passe',
    'profile.support': 'Support',
    'profile.help_center': 'Centre d\'aide',
    'profile.contact_support': 'Contacter le support',
    'profile.terms_privacy': 'Conditions et confidentialité',
    'profile.logout_success': 'Déconnexion réussie',
    'profile.see_you_soon': 'À bientôt sur Bali\'Pass !',
    'profile.logout_error': 'Impossible de se déconnecter',
    'profile.preferences_updated': 'Préférences mises à jour',
    'profile.preferences_saved': 'Vos préférences ont été sauvegardées',
    'profile.preferences_error': 'Impossible de sauvegarder les préférences',
    'profile.discover_bali_pass': 'Découvrir Bali\'Pass',
    
    // Community
    'community.title': 'Communauté',
    'community.share_experiences': 'Partagez vos expériences',
    'community.loading': 'Chargement de la communauté...',
    'community.search_placeholder': 'Rechercher dans la communauté...',
    'community.publish': 'Publier',
    'community.top_contributors': 'Top Contributeurs',
    'community.most_active': 'Les plus actifs cette semaine',
    'community.this_week': 'Cette semaine',
    'community.expert': 'Expert',
    'community.adventurer': 'Aventurier',
    'community.explorer': 'Explorer',
    'community.posts': 'posts',
    'community.no_contributors': 'Aucun contributeur pour le moment',
    'community.no_posts': 'Aucun post pour le moment',
    'community.be_first': 'Soyez le premier à partager votre expérience et inspirez la communauté !',
    'community.create_post': 'Créer un post',
    'community.member': 'Membre',
    'community.view_partner': 'Voir le partenaire',
    
    // Explorer
    'explorer.offers': 'Offres',
    'explorer.partners': 'Partenaires',
    'explorer.search_offers': 'Rechercher des offres...',
    'explorer.search_partners': 'Rechercher des partenaires...',
    'explorer.no_offers': 'Aucune offre trouvée',
    'explorer.no_partners': 'Aucun partenaire trouvé',
    'explorer.loading_offers': 'Chargement des offres...',
    'explorer.loading_partners': 'Chargement des partenaires...',
    
    // Favorites
    'favorites.title': 'Mes Favoris',
    'favorites.no_favorites': 'Aucun favori pour le moment',
    'favorites.explore_partners': 'Explorer les partenaires',
    'favorites.added_on': 'Ajouté le',
    'favorites.loading_error': 'Impossible de charger les favoris',
    
    // Partner
    'partner.call': 'Appeler',
    'partner.directions': 'Itinéraire',
    'partner.contact_info': 'Informations de contact',
    'partner.address': 'Adresse',
    'partner.website': 'Site web',
    'partner.offers': 'Offres',
    'partner.no_offers': 'Aucune offre disponible',
    'partner.not_found': 'Partenaire introuvable',
    
    // Offers
    'offer.use_offer': 'Utiliser l\'offre',
    'offer.share': 'Partager',
    'offer.favorite': 'Favori',
    'offer.not_found': 'Offre introuvable',
    'offer.description': 'Description',
    'offer.conditions': 'Conditions',
    'offer.valid_until': 'Valable jusqu\'au',
    'offer.discount': 'de réduction',
    'offer.free': 'gratuit',
    
    // Actions
    'action.scan_qr': 'Scanner le QR code',
    'action.get_directions': 'Obtenir l\'itinéraire',
    'action.call_partner': 'Appeler le partenaire',
    'action.visit_website': 'Visiter le site web',
    'action.share_offer': 'Partager l\'offre',
    'action.add_favorite': 'Ajouter aux favoris',
    'action.remove_favorite': 'Retirer des favoris',
    
    // Toast messages
    'toast.added_to_favorites': 'Ajouté aux favoris',
    'toast.removed_from_favorites': 'Retiré des favoris',
    'toast.must_be_logged_in': 'Vous devez être connecté pour ajouter aux favoris',
    'toast.link_copied': 'Lien copié dans le presse-papier',
    'toast.share_error': 'Impossible de partager',
    'toast.scan_qr': 'Scanner QR',
    'toast.qr_feature_coming': 'Fonctionnalité de scan QR à venir',
    
    // Footer
    'footer.ready_for_bali': 'Prêt à profiter de Bali ?',
    'footer.discover_exclusive': 'Découvre tous les avantages exclusifs dès maintenant',
    
    // Hero sections
    'hero.welcome_to_bali': 'Bienvenue à Bali',
    'hero.privilege_pass': 'Votre pass privilège',
    'hero.exclusive_discounts': 'Des réductions exclusives dans les meilleurs endroits de Bali',
    'hero.get_your_pass': 'Obtenir votre pass',
    'hero.welcome_back': 'Bon retour',
    'hero.ready_to_save': 'Prêt à économiser',
    'hero.scan_and_save': 'Scannez et économisez chez vos partenaires favoris',
  }
} as const;

export function TranslationProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<'en' | 'fr'>('en');

  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations[typeof language]] || key;
  };

  return (
    <TranslationContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </TranslationContext.Provider>
  );
}

export function useTranslation() {
  const context = useContext(TranslationContext);
  if (context === undefined) {
    throw new Error('useTranslation must be used within a TranslationProvider');
  }
  return context;
}