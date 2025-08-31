import React, { useState } from 'react';
import { Camera, Heart, MessageCircle, Star, Filter, Search, TrendingUp, Users, Award } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BottomNavigation } from '@/components/BottomNavigation';
import { FloatingActionButton } from '@/components/FloatingActionButton';

interface CommunityPost {
  id: string;
  user: {
    name: string;
    avatar: string;
    badge?: string;
  };
  partner: {
    name: string;
    category: string;
  };
  rating: number;
  content: string;
  photos: string[];
  likes: number;
  comments: number;
  timeAgo: string;
  isLiked: boolean;
}

const mockPosts: CommunityPost[] = [
  {
    id: '1',
    user: {
      name: 'Sophie Martin',
      avatar: '/api/placeholder/40/40',
      badge: 'Explorer'
    },
    partner: {
      name: 'Warung Sunset',
      category: 'Restaurant'
    },
    rating: 5,
    content: 'Incroyable coucher de soleil et cuisine authentique ! Le nasi goreng était délicieux et l\'ambiance parfaite pour une soirée romantique. 🌅',
    photos: ['/api/placeholder/300/200', '/api/placeholder/300/200'],
    likes: 24,
    comments: 8,
    timeAgo: '2h',
    isLiked: false
  },
  {
    id: '2',
    user: {
      name: 'Alexandre Dubois',
      avatar: '/api/placeholder/40/40',
      badge: 'Aventurier'
    },
    partner: {
      name: 'Surf School Canggu',
      category: 'Activités'
    },
    rating: 4,
    content: 'Super cours de surf avec -30% grâce au pass ! Les instructeurs sont top et les vagues parfaites pour débuter. 🏄‍♂️',
    photos: ['/api/placeholder/300/200'],
    likes: 18,
    comments: 5,
    timeAgo: '5h',
    isLiked: true
  },
  {
    id: '3',
    user: {
      name: 'Marie Lopez',
      avatar: '/api/placeholder/40/40'
    },
    partner: {
      name: 'Spa Wellness Ubud',
      category: 'Bien-être'
    },
    rating: 5,
    content: 'Massage traditionnel balinais exceptionnel ! L\'ambiance zen et les produits naturels m\'ont transportée. Un vrai moment de détente.',
    photos: [],
    likes: 32,
    comments: 12,
    timeAgo: '1j',
    isLiked: false
  }
];

const topUsers = [
  { name: 'Sophie M.', avatar: '/api/placeholder/32/32', posts: 28, badge: 'Explorer' },
  { name: 'Alex D.', avatar: '/api/placeholder/32/32', posts: 24, badge: 'Aventurier' },
  { name: 'Marie L.', avatar: '/api/placeholder/32/32', posts: 19, badge: 'Local' }
];

const Community: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('recent');
  const [posts, setPosts] = useState(mockPosts);

  const toggleLike = (postId: string) => {
    setPosts(posts.map(post => 
      post.id === postId 
        ? { 
            ...post, 
            isLiked: !post.isLiked,
            likes: post.isLiked ? post.likes - 1 : post.likes + 1
          }
        : post
    ));
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${i < rating ? 'text-yellow-400 fill-current' : 'text-muted-foreground'}`}
      />
    ));
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-foreground">Communauté</h1>
            <Button size="sm" variant="outline">
              <Camera className="w-4 h-4 mr-2" />
              Partager
            </Button>
          </div>
          
          <div className="flex items-center gap-2 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher dans la communauté..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline" size="icon">
              <Filter className="h-4 w-4" />
            </Button>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="recent" className="text-xs">
                <TrendingUp className="w-3 h-3 mr-1" />
                Récents
              </TabsTrigger>
              <TabsTrigger value="popular" className="text-xs">
                <Heart className="w-3 h-3 mr-1" />
                Populaires
              </TabsTrigger>
              <TabsTrigger value="following" className="text-xs">
                <Users className="w-3 h-3 mr-1" />
                Abonnés
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      {/* Content */}
      <div className="pb-20">
        <Tabs value={activeTab} className="w-full">
          <TabsContent value="recent" className="mt-0">
            {/* Community Stats */}
            <div className="p-4 mb-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-foreground">Top contributeurs</h3>
                    <Badge variant="secondary">Cette semaine</Badge>
                  </div>
                  <div className="space-y-3">
                    {topUsers.map((user, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs px-2 py-1">
                              #{index + 1}
                            </Badge>
                            <Avatar className="w-8 h-8">
                              <AvatarImage src={user.avatar} />
                              <AvatarFallback>{user.name[0]}</AvatarFallback>
                            </Avatar>
                          </div>
                          <div>
                            <p className="font-medium text-sm">{user.name}</p>
                            <div className="flex items-center gap-1">
                              <Award className="w-3 h-3 text-primary" />
                              <span className="text-xs text-muted-foreground">{user.badge}</span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium">{user.posts}</p>
                          <p className="text-xs text-muted-foreground">posts</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Posts Feed */}
            <div className="space-y-4 px-4">
              {posts.map((post) => (
                <Card key={post.id}>
                  <CardHeader className="pb-3">
                    <div className="flex items-start gap-3">
                      <Avatar className="w-10 h-10">
                        <AvatarImage src={post.user.avatar} />
                        <AvatarFallback>{post.user.name[0]}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-medium text-sm">{post.user.name}</p>
                          {post.user.badge && (
                            <Badge variant="secondary" className="text-xs">
                              {post.user.badge}
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span>{post.partner.name}</span>
                          <span>•</span>
                          <span>{post.partner.category}</span>
                          <span>•</span>
                          <span>{post.timeAgo}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        {renderStars(post.rating)}
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="pt-0">
                    <p className="text-sm mb-3 leading-relaxed">{post.content}</p>
                    
                    {post.photos.length > 0 && (
                      <div className={`grid gap-2 mb-3 ${
                        post.photos.length === 1 ? 'grid-cols-1' : 'grid-cols-2'
                      }`}>
                        {post.photos.map((photo, index) => (
                          <div key={index} className="aspect-video bg-muted rounded-lg overflow-hidden">
                            <img
                              src={photo}
                              alt={`Photo ${index + 1}`}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ))}
                      </div>
                    )}
                    
                    <div className="flex items-center justify-between pt-3 border-t border-border">
                      <div className="flex items-center gap-4">
                        <button
                          onClick={() => toggleLike(post.id)}
                          className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
                        >
                          <Heart className={`w-4 h-4 ${post.isLiked ? 'text-red-500 fill-current' : ''}`} />
                          {post.likes}
                        </button>
                        <button className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
                          <MessageCircle className="w-4 h-4" />
                          {post.comments}
                        </button>
                      </div>
                      <Button variant="ghost" size="sm" className="text-xs">
                        Voir l'offre
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="popular" className="mt-0">
            <div className="p-4 text-center">
              <div className="py-12">
                <TrendingUp className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="font-semibold mb-2">Posts populaires</h3>
                <p className="text-sm text-muted-foreground">
                  Les posts les plus aimés de la communauté
                </p>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="following" className="mt-0">
            <div className="p-4 text-center">
              <div className="py-12">
                <Users className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="font-semibold mb-2">Abonnements</h3>
                <p className="text-sm text-muted-foreground">
                  Posts des utilisateurs que vous suivez
                </p>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Floating Action Button */}
      <FloatingActionButton />

      {/* Bottom Navigation */}
      <BottomNavigation />
    </div>
  );
};

export default Community;