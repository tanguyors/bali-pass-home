import { createContext, useContext, useState, ReactNode } from 'react';

interface TranslationContextType {
  language: 'en' | 'fr' | 'id';
  setLanguage: (lang: 'en' | 'fr' | 'id') => void;
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
    'explorer.near_me': 'Near me',
    'explorer.all_offers': 'All offers',
    
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
    'offer.used_successfully': 'Offer used successfully!',
    'offer.already_used': 'Offer already used',
    'offer.enjoy_discount': 'Enjoy your discount at the partner',
    'offer.use_error': 'Unable to use offer',
    
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
    
    // Reassurance
    'reassurance.secure_payment': 'Secure payment',
    'reassurance.valid_12_months': 'Valid 12 months',
    'reassurance.verified_partners': 'Verified partners',
    
    // Error
    'error.page_not_found': 'Oops! Page not found',
    'error.return_home': 'Return to Home',
    
    // Pricing
    'pricing.you_pay': 'You pay',
    'pricing.you_save': 'You save',
    
    // Categories
    'categories.title': 'Categories',
    'categories.subtitle': 'Find what interests you',
    
    // Featured Offers
    'featured_offers.title': 'Featured Offers',
    'featured_offers.subtitle': 'The best opportunities of the moment',
    
    // Offers
    'offers.view_offer': 'View Offer',
    'offers.connect_message': 'Connect and get your Bali\'Pass',
    'offers.access_details': 'Access full offer details',
    'offers.connect_button': 'Connect',
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
    'explorer.near_me': 'Autour de moi',
    'explorer.all_offers': 'Toutes les offres',
    
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
    'offer.used_successfully': 'Offre utilisée avec succès !',
    'offer.already_used': 'Offre déjà utilisée',
    'offer.enjoy_discount': 'Profitez de votre réduction chez le partenaire',
    'offer.use_error': 'Impossible d\'utiliser l\'offre',
    
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
    
    // Reassurance
    'reassurance.secure_payment': 'Paiement sécurisé',
    'reassurance.valid_12_months': 'Valide 12 mois',
    'reassurance.verified_partners': 'Partenaires vérifiés',
    
    // Error
    'error.page_not_found': 'Oups ! Page introuvable',
    'error.return_home': 'Retour à l\'accueil',
    
    // Pricing
    'pricing.you_pay': 'Vous payez',
    'pricing.you_save': 'Vous économisez',
    
    // Categories
    'categories.title': 'Catégories',
    'categories.subtitle': 'Trouve ce qui t\'intéresse',
    
    // Featured Offers
    'featured_offers.title': 'Offres mises en avant',
    'featured_offers.subtitle': 'Les meilleures opportunités du moment',
    
    // Offers
    'offers.view_offer': 'Voir l\'offre',
    'offers.connect_message': 'Connectez-vous et obtenez votre Bali\'Pass',
    'offers.access_details': 'Accédez aux détails complets des offres',
    'offers.connect_button': 'Se connecter',
  },
  id: {
    // Navigation
    'nav.home': 'Beranda',
    'nav.explorer': 'Jelajahi',
    'nav.my_pass': 'Pass Saya',
    'nav.profile': 'Profil',
    'nav.favorites': 'Favorit',
    
    // Common
    'common.loading': 'Memuat...',
    'common.search': 'Cari',
    'common.filter': 'Filter',
    'common.save': 'Simpan',
    'common.cancel': 'Batal',
    'common.confirm': 'Konfirmasi',
    'common.error': 'Error',
    'common.success': 'Berhasil',
    'common.email': 'Email',
    'common.password': 'Kata Sandi',
    'common.phone': 'Telepon',
    'common.name': 'Nama',
    'common.learn_more': 'Pelajari lebih lanjut',
    
    // Auth
    'auth.sign_in': 'Masuk',
    'auth.sign_up': 'Daftar',
    'auth.create_account': 'Buat Akun',
    'auth.signing_in': 'Sedang Masuk...',
    'auth.creating_account': 'Membuat Akun...',
    'auth.first_name': 'Nama Depan',
    'auth.last_name': 'Nama Belakang',
    'auth.phone_number': 'Nomor Telepon',
    'auth.birth_date': 'Tanggal Lahir',
    'auth.accept_terms': 'Saya menerima syarat',
    'auth.terms_full': 'Saya telah membaca dan menerima Syarat Penjualan, Syarat Penggunaan, Kebijakan Privasi dan Kebijakan Pengembalian',
    'auth.password_min': 'Kata sandi minimal 6 karakter',
    'auth.must_accept_terms': 'Anda harus menerima syarat penggunaan',
    'auth.login_error': 'Error Login',
    'auth.signup_error': 'Error Pendaftaran',
    'auth.invalid_credentials': 'Email atau kata sandi salah',
    'auth.user_exists': 'Akun dengan email ini sudah ada. Coba untuk masuk.',
    'auth.signup_success': 'Pendaftaran berhasil!',
    'auth.verify_email': 'Periksa email Anda untuk konfirmasi akun.',
    'auth.login_success': 'Login berhasil',
    'auth.welcome': 'Selamat datang di Bali Pass!',
    'auth.unexpected_error': 'Terjadi kesalahan tak terduga',
    
    // Pass
    'pass.my_pass': 'Bali Pass Saya',
    'pass.get_pass': 'Dapatkan Bali Pass',
    'pass.active': 'Aktif',
    'pass.inactive': 'Tidak Aktif',
    'pass.expired': 'Kadaluarsa',
    'pass.pending': 'Tertunda',
    'pass.no_pass': 'Tidak ada pass',
    'pass.expires_on': 'Berakhir pada',
    'pass.validity': 'Validitas',
    'pass.days_remaining': 'hari tersisa',
    'pass.your_privilege_pass': 'Pass istimewa Anda untuk Bali',
    'pass.connect_to_access': 'Masuk untuk mengakses pass Anda dan temukan penghematan',
    'pass.benefits_included': 'Manfaat yang termasuk',
    'pass.exclusive_discounts': 'Diskon eksklusif di 50+ mitra',
    'pass.simple_qr_scan': 'Scan QR code sederhana',
    'pass.valid_12_months': 'Berlaku 12 bulan',
    'pass.support_24_7': 'Dukungan pelanggan 24/7',
    'pass.discover_offers': 'Temukan penawaran',
    
    // Profile
    'profile.connect': 'Masuk',
    'profile.create_account': 'Buat Akun',
    'profile.sign_out': 'Keluar',
    'profile.access_profile': 'Akses profil Anda dan kelola preferensi Bali Pass',
    'profile.quick_actions': 'Aksi Cepat',
    'profile.scan_partner': 'Scan Mitra',
    'profile.view_offers': 'Lihat Penawaran',
    'profile.my_savings': 'Penghematan Saya',
    'profile.uses': 'penggunaan',
    'profile.recent_activity': 'Aktivitas Terbaru',
    'profile.no_activity': 'Tidak ada aktivitas',
    'profile.start_using': 'Mulai gunakan pass Anda untuk melihat penghematan di sini',
    'profile.personal_info': 'Informasi Pribadi',
    'profile.full_name': 'Nama Lengkap',
    'profile.language': 'Bahasa',
    'profile.preferences': 'Preferensi',
    'profile.push_notifications': 'Notifikasi push',
    'profile.email_notifications': 'Notifikasi email',
    'profile.security': 'Keamanan',
    'profile.change_password': 'Ubah Kata Sandi',
    'profile.support': 'Dukungan',
    'profile.help_center': 'Pusat Bantuan',
    'profile.contact_support': 'Hubungi Dukungan',
    'profile.terms_privacy': 'Syarat & Privasi',
    'profile.logout_success': 'Berhasil keluar',
    'profile.see_you_soon': 'Sampai jumpa lagi di Bali Pass!',
    'profile.logout_error': 'Tidak dapat keluar',
    'profile.preferences_updated': 'Preferensi diperbarui',
    'profile.preferences_saved': 'Preferensi Anda telah disimpan',
    'profile.preferences_error': 'Tidak dapat menyimpan preferensi',
    'profile.discover_bali_pass': 'Temukan Bali Pass',
    
    // Explorer
    'explorer.offers': 'Penawaran',
    'explorer.partners': 'Mitra',
    'explorer.search_offers': 'Cari penawaran...',
    'explorer.search_partners': 'Cari mitra...',
    'explorer.no_offers': 'Tidak ada penawaran ditemukan',
    'explorer.no_partners': 'Tidak ada mitra ditemukan',
    'explorer.loading_offers': 'Memuat penawaran...',
    'explorer.loading_partners': 'Memuat mitra...',
    'explorer.near_me': 'Sekitar saya',
    'explorer.all_offers': 'Semua penawaran',
    
    // Favorites
    'favorites.title': 'Favorit Saya',
    'favorites.no_favorites': 'Belum ada favorit',
    'favorites.explore_partners': 'Jelajahi Mitra',
    'favorites.added_on': 'Ditambahkan pada',
    'favorites.loading_error': 'Tidak dapat memuat favorit',
    
    // Partner
    'partner.call': 'Telepon',
    'partner.directions': 'Petunjuk Arah',
    'partner.contact_info': 'Informasi Kontak',
    'partner.address': 'Alamat',
    'partner.website': 'Website',
    'partner.offers': 'Penawaran',
    'partner.no_offers': 'Tidak ada penawaran tersedia',
    'partner.not_found': 'Mitra tidak ditemukan',
    
    // Offers
    'offer.use_offer': 'Gunakan Penawaran',
    'offer.share': 'Bagikan',
    'offer.favorite': 'Favorit',
    'offer.not_found': 'Penawaran tidak ditemukan',
    'offer.description': 'Deskripsi',
    'offer.conditions': 'Syarat',
    'offer.valid_until': 'Berlaku hingga',
    'offer.discount': 'diskon',
    'offer.free': 'gratis',
    'offer.used_successfully': 'Penawaran berhasil digunakan!',
    'offer.already_used': 'Penawaran sudah digunakan',
    'offer.enjoy_discount': 'Nikmati diskon Anda di mitra',
    'offer.use_error': 'Tidak dapat menggunakan penawaran',
    
    // Actions
    'action.scan_qr': 'Scan kode QR',
    'action.get_directions': 'Dapatkan petunjuk arah',
    'action.call_partner': 'Telepon mitra',
    'action.visit_website': 'Kunjungi website',
    'action.share_offer': 'Bagikan penawaran',
    'action.add_favorite': 'Tambah ke favorit',
    'action.remove_favorite': 'Hapus dari favorit',
    
    // Toast messages
    'toast.added_to_favorites': 'Ditambahkan ke favorit',
    'toast.removed_from_favorites': 'Dihapus dari favorit',
    'toast.must_be_logged_in': 'Anda harus login untuk menambah favorit',
    'toast.link_copied': 'Link disalin ke clipboard',
    'toast.share_error': 'Tidak dapat membagikan',
    'toast.scan_qr': 'Scan QR',
    'toast.qr_feature_coming': 'Fitur scan QR segera hadir',
    
    // Footer
    'footer.ready_for_bali': 'Siap menikmati Bali?',
    'footer.discover_exclusive': 'Temukan semua manfaat eksklusif sekarang',
    
    // Hero sections
    'hero.welcome_to_bali': 'Selamat datang di Bali',
    'hero.privilege_pass': 'Pass istimewa Anda',
    'hero.exclusive_discounts': 'Diskon eksklusif di tempat-tempat terbaik di Bali',
    'hero.get_your_pass': 'Dapatkan pass Anda',
    'hero.welcome_back': 'Selamat datang kembali',
    'hero.ready_to_save': 'Siap berhemat',
    'hero.scan_and_save': 'Scan dan hemat di mitra favorit Anda',
    
    // Reassurance
    'reassurance.secure_payment': 'Pembayaran aman',
    'reassurance.valid_12_months': 'Berlaku 12 bulan',
    'reassurance.verified_partners': 'Mitra terverifikasi',
    
    // Error
    'error.page_not_found': 'Ups! Halaman tidak ditemukan',
    'error.return_home': 'Kembali ke Beranda',
    
    // Pricing
    'pricing.you_pay': 'Anda bayar',
    'pricing.you_save': 'Anda hemat',
    
    // Categories
    'categories.title': 'Kategori',
    'categories.subtitle': 'Temukan yang menarik minat Anda',
    
    // Featured Offers
    'featured_offers.title': 'Penawaran Unggulan',
    'featured_offers.subtitle': 'Kesempatan terbaik saat ini',
    
    // Offers
    'offers.view_offer': 'Lihat Penawaran',
    'offers.connect_message': 'Masuk dan dapatkan Bali\'Pass Anda',
    'offers.access_details': 'Akses detail penawaran lengkap',
    'offers.connect_button': 'Masuk',
  }
} as const;

export function TranslationProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<'en' | 'fr' | 'id'>('en');

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