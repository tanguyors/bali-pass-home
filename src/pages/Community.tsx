import React, { useState } from 'react';
import { Camera, Heart, MessageCircle, Star, Filter, Search, TrendingUp, Users, Award, Plus } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BottomNavigation } from '@/components/BottomNavigation';
import { FloatingActionButton } from '@/components/FloatingActionButton';
import { useCommunity } from '@/hooks/useCommunity';
import CreatePostDialog from '@/components/CreatePostDialog';


const Community: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('recent');
  const [isCreatePostOpen, setIsCreatePostOpen] = useState(false);
  
  const { posts, topContributors, loading, createPost, toggleLike } = useCommunity();

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `${minutes}min`;
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `${hours}h`;
    } else {
      const days = Math.floor(diffInSeconds / 86400);
      return `${days}j`;
    }
  };

  const getUserDisplayName = (profile: any) => {
    if (!profile) return 'Utilisateur';
    if (profile.name) return profile.name;
    if (profile.first_name && profile.last_name) {
      return `${profile.first_name} ${profile.last_name}`;
    }
    if (profile.first_name) return profile.first_name;
    return 'Utilisateur';
  };

  const renderStars = (rating?: number) => {
    if (!rating) return null;
    return (
      <div className="flex items-center gap-1">
        {Array.from({ length: 5 }, (_, i) => (
          <Star
            key={i}
            className={`w-4 h-4 ${i < rating ? 'text-yellow-400 fill-current' : 'text-muted-foreground'}`}
          />
        ))}
      </div>
    );
  };

  const filteredPosts = posts.filter(post =>
    !searchQuery ||
    post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
    post.partners?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    getUserDisplayName(post.profiles).toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Chargement de la communauté...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-foreground">Communauté</h1>
            <Button 
              size="sm" 
              onClick={() => setIsCreatePostOpen(true)}
              className="gap-2"
            >
              <Plus className="w-4 h-4" />
              Publier
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
                    {topContributors.length > 0 ? topContributors.map((contributor, index) => {
                      const displayName = getUserDisplayName(contributor.profile);
                      return (
                        <div key={index} className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="text-xs px-2 py-1">
                                #{index + 1}
                              </Badge>
                              <Avatar className="w-8 h-8">
                                <AvatarFallback>{displayName[0]?.toUpperCase()}</AvatarFallback>
                              </Avatar>
                            </div>
                            <div>
                              <p className="font-medium text-sm">{displayName}</p>
                              <div className="flex items-center gap-1">
                                <Award className="w-3 h-3 text-primary" />
                                <span className="text-xs text-muted-foreground">
                                  {contributor.count >= 10 ? 'Expert' : contributor.count >= 5 ? 'Aventurier' : 'Explorer'}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium">{contributor.count}</p>
                            <p className="text-xs text-muted-foreground">posts</p>
                          </div>
                        </div>
                      );
                    }) : (
                      <div className="text-center py-4">
                        <p className="text-sm text-muted-foreground">Aucun contributeur pour le moment</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Posts Feed */}
            <div className="space-y-4 px-4">
              {filteredPosts.length === 0 ? (
                <div className="text-center py-12">
                  <Users className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="font-semibold mb-2">Aucun post pour le moment</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Soyez le premier à partager votre expérience !
                  </p>
                  <Button onClick={() => setIsCreatePostOpen(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Créer un post
                  </Button>
                </div>
              ) : (
                filteredPosts.map((post) => (
                  <Card key={post.id}>
                    <CardHeader className="pb-3">
                      <div className="flex items-start gap-3">
                        <Avatar className="w-10 h-10">
                          <AvatarFallback>{getUserDisplayName(post.profiles)[0]?.toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-medium text-sm">{getUserDisplayName(post.profiles)}</p>
                            <Badge variant="secondary" className="text-xs">
                              Membre
                            </Badge>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            {post.partners && (
                              <>
                                <span>{post.partners.name}</span>
                                <span>•</span>
                              </>
                            )}
                            <span>{getTimeAgo(post.created_at)}</span>
                          </div>
                        </div>
                        {post.rating && renderStars(post.rating)}
                      </div>
                    </CardHeader>
                    
                    <CardContent className="pt-0">
                      <p className="text-sm mb-3 leading-relaxed">{post.content}</p>
                      
                      {post.photos && post.photos.length > 0 && (
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
                            <Heart className={`w-4 h-4 ${post.user_has_liked ? 'text-red-500 fill-current' : ''}`} />
                            {post.likes_count}
                          </button>
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <MessageCircle className="w-4 h-4" />
                            {post.comments_count}
                          </div>
                        </div>
                        {post.partners && (
                          <Button variant="ghost" size="sm" className="text-xs">
                            Voir le partenaire
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
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

      {/* Create Post Dialog */}
      <CreatePostDialog
        isOpen={isCreatePostOpen}
        onClose={() => setIsCreatePostOpen(false)}
        onSubmit={createPost}
      />

      {/* Floating Action Button */}
      <FloatingActionButton />

      {/* Bottom Navigation */}
      <BottomNavigation />
    </div>
  );
};

export default Community;