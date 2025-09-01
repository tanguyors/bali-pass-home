import React, { useState } from 'react';
import { Heart, MessageCircle, Star, Filter, Search, Users, Award, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { BottomNavigation } from '@/components/BottomNavigation';
import { FloatingActionButton } from '@/components/FloatingActionButton';
import { useCommunity } from '@/hooks/useCommunity';
import CreatePostDialog from '@/components/CreatePostDialog';
import { useTranslation } from '@/hooks/useTranslation';


const Community: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreatePostOpen, setIsCreatePostOpen] = useState(false);
  const navigate = useNavigate();
  const { t } = useTranslation();
  
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
    if (!profile) return t('common.name');
    if (profile.name) return profile.name;
    if (profile.first_name && profile.last_name) {
      return `${profile.first_name} ${profile.last_name}`;
    }
    if (profile.first_name) return profile.first_name;
    return t('common.name');
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
          <p className="text-muted-foreground">{t('community.loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      {/* Header avec gradient */}
      <div className="sticky top-0 z-10 bg-gradient-to-r from-background/95 via-background/98 to-primary/5 backdrop-blur-xl border-b border-border/50">
        <div className="p-4">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent">
                {t('community.title')}
              </h1>
              <p className="text-sm text-muted-foreground mt-1">{t('community.share_experiences')}</p>
            </div>
            <Button 
              onClick={() => setIsCreatePostOpen(true)}
              className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg hover:shadow-xl transition-all duration-300 gap-2"
            >
              <Plus className="w-4 h-4" />
              {t('community.publish')}
            </Button>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={t('community.search_placeholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-card/60 backdrop-blur-sm border-border/50 focus:bg-card/80 transition-all duration-300"
              />
            </div>
            <Button variant="outline" size="icon" className="bg-card/60 backdrop-blur-sm border-border/50 hover:bg-card/80 transition-all duration-300">
              <Filter className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="pb-20">
        {/* Top Contributors avec design moderne */}
        <div className="p-4 mb-6">
          <Card className="shadow-xl border-0 bg-gradient-to-br from-card/80 via-card/70 to-primary/5 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-primary/20 to-primary/5 rounded-xl flex items-center justify-center">
                    <Award className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">{t('community.top_contributors')}</h3>
                    <p className="text-sm text-muted-foreground">{t('community.most_active')}</p>
                  </div>
                </div>
                <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
                  {t('community.this_week')}
                </Badge>
              </div>
              
              <div className="space-y-4">
                {topContributors.length > 0 ? topContributors.map((contributor, index) => {
                  const displayName = getUserDisplayName(contributor.profile);
                  const isTop3 = index < 3;
                  const podiumColors = ['from-yellow-400/20 to-yellow-500/10', 'from-gray-400/20 to-gray-500/10', 'from-orange-400/20 to-orange-500/10'];
                  
                  return (
                    <div 
                      key={index} 
                      className={`flex items-center justify-between p-4 rounded-xl transition-all duration-300 hover:scale-105 ${
                        isTop3 
                          ? `bg-gradient-to-r ${podiumColors[index]} border border-current/20 shadow-lg` 
                          : 'bg-card/40 hover:bg-card/60'
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                            isTop3 
                              ? index === 0 ? 'bg-yellow-500/20 text-yellow-600 border-2 border-yellow-500/30' 
                                : index === 1 ? 'bg-gray-500/20 text-gray-600 border-2 border-gray-500/30'
                                : 'bg-orange-500/20 text-orange-600 border-2 border-orange-500/30'
                              : 'bg-muted text-muted-foreground'
                          }`}>
                            #{index + 1}
                          </div>
                          <Avatar className="w-12 h-12 border-2 border-primary/20">
                            <AvatarFallback className="bg-gradient-to-br from-primary/10 to-primary/5 text-primary font-semibold">
                              {displayName[0]?.toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                        </div>
                        <div>
                          <p className="font-semibold">{displayName}</p>
                          <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${
                              contributor.count >= 10 ? 'bg-purple-500' : 
                              contributor.count >= 5 ? 'bg-blue-500' : 'bg-green-500'
                            }`}></div>
                            <span className="text-sm text-muted-foreground">
                              {contributor.count >= 10 ? t('community.expert') : contributor.count >= 5 ? t('community.adventurer') : t('community.explorer')}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-2">
                          <div className="text-right">
                            <p className="font-bold text-lg">{contributor.count}</p>
                            <p className="text-xs text-muted-foreground">{t('community.posts')}</p>
                          </div>
                          {isTop3 && (
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                              index === 0 ? 'bg-yellow-500/20' : 
                              index === 1 ? 'bg-gray-500/20' : 'bg-orange-500/20'
                            }`}>
                              <Star className={`w-4 h-4 ${
                                index === 0 ? 'text-yellow-600' : 
                                index === 1 ? 'text-gray-600' : 'text-orange-600'
                              }`} />
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                }) : (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-gradient-to-br from-primary/10 to-primary/5 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Users className="w-8 h-8 text-primary" />
                    </div>
                    <p className="text-muted-foreground">{t('community.no_contributors')}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Posts Feed avec design moderne */}
        <div className="space-y-6 px-4">
          {filteredPosts.length === 0 ? (
            <Card className="shadow-xl border-0 bg-card/60 backdrop-blur-sm">
              <CardContent className="text-center py-16">
                <div className="w-20 h-20 bg-gradient-to-br from-primary/10 to-primary/5 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Users className="w-10 h-10 text-primary" />
                </div>
                <h3 className="font-bold text-xl mb-3">{t('community.no_posts')}</h3>
                <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                  {t('community.be_first')}
                </p>
                <Button 
                  onClick={() => setIsCreatePostOpen(true)}
                  className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  {t('community.create_post')}
                </Button>
              </CardContent>
            </Card>
          ) : (
            filteredPosts.map((post) => (
              <Card key={post.id} className="shadow-lg border-0 bg-card/80 backdrop-blur-sm hover:shadow-xl hover:bg-card/90 transition-all duration-300 group">
                <CardHeader className="pb-4">
                  <div className="flex items-start gap-4">
                    <Avatar className="w-12 h-12 border-2 border-primary/20 group-hover:border-primary/40 transition-colors duration-300">
                      <AvatarFallback className="bg-gradient-to-br from-primary/10 to-primary/5 text-primary font-semibold">
                        {getUserDisplayName(post.profiles)[0]?.toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <p className="font-semibold">{getUserDisplayName(post.profiles)}</p>
                        <Badge variant="secondary" className="text-xs bg-primary/10 text-primary border-primary/20">
                          {t('community.member')}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        {post.partners && (
                          <>
                            <span className="font-medium text-primary">{post.partners.name}</span>
                            <span>•</span>
                          </>
                        )}
                        <span>{getTimeAgo(post.created_at)}</span>
                      </div>
                    </div>
                    {post.rating && (
                      <div className="bg-gradient-to-r from-yellow-500/10 to-yellow-500/5 px-3 py-1 rounded-full">
                        {renderStars(post.rating)}
                      </div>
                    )}
                  </div>
                </CardHeader>
                
                <CardContent className="pt-0">
                  <p className="text-sm mb-4 leading-relaxed">{post.content}</p>
                  
                  {post.photos && post.photos.length > 0 && (
                    <div className={`grid gap-3 mb-4 ${
                      post.photos.length === 1 ? 'grid-cols-1' : 'grid-cols-2'
                    }`}>
                      {post.photos.map((photo, index) => (
                        <div key={index} className="aspect-video bg-muted/50 rounded-xl overflow-hidden group-hover:shadow-lg transition-shadow duration-300">
                          <img
                            src={photo}
                            alt={`Photo ${index + 1}`}
                            className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                          />
                        </div>
                      ))}
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between pt-4 border-t border-border/50">
                    <div className="flex items-center gap-6">
                      <button
                        onClick={() => toggleLike(post.id)}
                        className={`flex items-center gap-2 text-sm transition-all duration-300 hover:scale-105 ${
                          post.user_has_liked 
                            ? 'text-red-500' 
                            : 'text-muted-foreground hover:text-red-500'
                        }`}
                      >
                        <Heart className={`w-5 h-5 ${post.user_has_liked ? 'fill-current' : ''}`} />
                        <span className="font-medium">{post.likes_count}</span>
                      </button>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <MessageCircle className="w-5 h-5" />
                        <span className="font-medium">{post.comments_count}</span>
                      </div>
                    </div>
                    {post.partners && (
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => navigate(`/partner/${post.partners.slug}`)}
                        className="text-xs bg-primary/10 text-primary hover:bg-primary/20 transition-all duration-300"
                      >
                        {t('community.view_partner')}
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
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