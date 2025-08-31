import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface CommunityPost {
  id: string;
  user_id: string;
  partner_id?: string;
  offer_id?: string;
  content: string;
  rating?: number;
  photos: string[];
  likes_count: number;
  comments_count: number;
  created_at: string;
  updated_at: string;
  profiles: {
    name?: string;
    first_name?: string;
    last_name?: string;
  } | null;
  partners?: {
    name: string;
    slug: string;
  } | null;
  offers?: {
    title: string;
    slug: string;
  } | null;
  user_has_liked?: boolean;
}

export interface CommunityComment {
  id: string;
  post_id: string;
  user_id: string;
  content: string;
  created_at: string;
  profiles: {
    name?: string;
    first_name?: string;
    last_name?: string;
  } | null;
}

export function useCommunity() {
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [topContributors, setTopContributors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchPosts = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      // Fetch posts without joins first
      const { data: postsData, error: postsError } = await supabase
        .from('community_posts')
        .select('*')
        .order('created_at', { ascending: false });

      if (postsError) {
        console.error('Error fetching posts:', postsError);
        return;
      }

      if (!postsData || postsData.length === 0) {
        setPosts([]);
        return;
      }

      // Get user profiles for all posts
      const userIds = [...new Set(postsData.map(post => post.user_id))];
      const { data: profilesData } = await supabase
        .from('profiles')
        .select('user_id, name, first_name, last_name')
        .in('user_id', userIds);

      // Get partner info for posts that have partner_id
      const partnerIds = postsData.filter(post => post.partner_id).map(post => post.partner_id);
      const { data: partnersData } = partnerIds.length > 0 ? await supabase
        .from('partners')
        .select('id, name, slug')
        .in('id', partnerIds) : { data: [] };

      // Get offer info for posts that have offer_id
      const offerIds = postsData.filter(post => post.offer_id).map(post => post.offer_id);
      const { data: offersData } = offerIds.length > 0 ? await supabase
        .from('offers')
        .select('id, title, slug')
        .in('id', offerIds) : { data: [] };

      // Get likes for current user if authenticated
      let userLikes: any[] = [];
      if (user) {
        const { data: likesData } = await supabase
          .from('community_likes')
          .select('post_id')
          .eq('user_id', user.id);
        userLikes = likesData || [];
      }

      // Combine all data
      const enrichedPosts = postsData.map(post => {
        const profile = profilesData?.find(p => p.user_id === post.user_id);
        const partner = partnersData?.find(p => p.id === post.partner_id);
        const offer = offersData?.find(o => o.id === post.offer_id);
        
        return {
          ...post,
          profiles: profile ? {
            name: profile.name,
            first_name: profile.first_name,
            last_name: profile.last_name,
          } : null,
          partners: partner ? {
            name: partner.name,
            slug: partner.slug,
          } : null,
          offers: offer ? {
            title: offer.title,
            slug: offer.slug,
          } : null,
          user_has_liked: user ? userLikes.some(like => like.post_id === post.id) : false,
        };
      });

      setPosts(enrichedPosts);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTopContributors = async () => {
    try {
      // Fetch all posts to count per user
      const { data: postsData, error } = await supabase
        .from('community_posts')
        .select('user_id');

      if (error) {
        console.error('Error fetching posts for contributors:', error);
        return;
      }

      if (!postsData || postsData.length === 0) {
        setTopContributors([]);
        return;
      }

      // Count posts per user
      const userPostCounts = postsData.reduce((acc: any, post) => {
        const userId = post.user_id;
        if (!acc[userId]) {
          acc[userId] = { count: 0, userId };
        }
        acc[userId].count++;
        return acc;
      }, {});

      // Get top 3 users by post count
      const topUserIds = Object.values(userPostCounts)
        .sort((a: any, b: any) => b.count - a.count)
        .slice(0, 3);

      // Get profiles for these users
      const userIds = topUserIds.map((user: any) => user.userId);
      const { data: profilesData } = await supabase
        .from('profiles')
        .select('user_id, name, first_name, last_name')
        .in('user_id', userIds);

      // Combine data
      const contributors = topUserIds.map((user: any) => {
        const profile = profilesData?.find(p => p.user_id === user.userId);
        return {
          profile: profile ? {
            name: profile.name,
            first_name: profile.first_name,
            last_name: profile.last_name,
          } : null,
          count: user.count
        };
      });

      setTopContributors(contributors);
    } catch (error) {
      console.error('Error in fetchTopContributors:', error);
    }
  };

  const createPost = async (content: string, rating?: number, partnerId?: string, offerId?: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "Erreur",
          description: "Vous devez être connecté pour publier un avis.",
          variant: "destructive",
        });
        return null;
      }

      const { data, error } = await supabase
        .from('community_posts')
        .insert({
          user_id: user.id,
          content,
          rating,
          partner_id: partnerId,
          offer_id: offerId,
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating post:', error);
        toast({
          title: "Erreur",
          description: "Impossible de publier votre avis.",
          variant: "destructive",
        });
        return null;
      }

      toast({
        title: "Succès",
        description: "Votre avis a été publié !",
      });

      // Refresh posts
      fetchPosts();
      return data;
    } catch (error) {
      console.error('Error:', error);
      return null;
    }
  };

  const toggleLike = async (postId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "Erreur",
          description: "Vous devez être connecté pour aimer un post.",
          variant: "destructive",
        });
        return;
      }

      const post = posts.find(p => p.id === postId);
      if (!post) return;

      if (post.user_has_liked) {
        // Unlike
        const { error } = await supabase
          .from('community_likes')
          .delete()
          .eq('post_id', postId)
          .eq('user_id', user.id);

        if (error) {
          console.error('Error removing like:', error);
          return;
        }
      } else {
        // Like
        const { error } = await supabase
          .from('community_likes')
          .insert({
            post_id: postId,
            user_id: user.id,
          });

        if (error) {
          console.error('Error adding like:', error);
          return;
        }
      }

      // Update local state immediately for better UX
      setPosts(posts.map(p => 
        p.id === postId 
          ? {
              ...p,
              user_has_liked: !p.user_has_liked,
              likes_count: p.user_has_liked ? p.likes_count - 1 : p.likes_count + 1
            }
          : p
      ));
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  const fetchComments = async (postId: string): Promise<CommunityComment[]> => {
    try {
      // Fetch comments without joins first
      const { data: commentsData, error } = await supabase
        .from('community_comments')
        .select('*')
        .eq('post_id', postId)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching comments:', error);
        return [];
      }

      if (!commentsData || commentsData.length === 0) {
        return [];
      }

      // Get user profiles for all comments
      const userIds = [...new Set(commentsData.map(comment => comment.user_id))];
      const { data: profilesData } = await supabase
        .from('profiles')
        .select('user_id, name, first_name, last_name')
        .in('user_id', userIds);

      // Combine data
      const enrichedComments = commentsData.map(comment => {
        const profile = profilesData?.find(p => p.user_id === comment.user_id);
        
        return {
          ...comment,
          profiles: profile ? {
            name: profile.name,
            first_name: profile.first_name,
            last_name: profile.last_name,
          } : null,
        };
      });

      return enrichedComments;
    } catch (error) {
      console.error('Error:', error);
      return [];
    }
  };

  const addComment = async (postId: string, content: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "Erreur",
          description: "Vous devez être connecté pour commenter.",
          variant: "destructive",
        });
        return null;
      }

      const { data, error } = await supabase
        .from('community_comments')
        .insert({
          post_id: postId,
          user_id: user.id,
          content,
        })
        .select()
        .single();

      if (error) {
        console.error('Error adding comment:', error);
        toast({
          title: "Erreur",
          description: "Impossible d'ajouter votre commentaire.",
          variant: "destructive",
        });
        return null;
      }

      toast({
        title: "Succès",
        description: "Commentaire ajouté !",
      });

      return data;
    } catch (error) {
      console.error('Error:', error);
      return null;
    }
  };

  useEffect(() => {
    fetchPosts();
    fetchTopContributors();
  }, []);

  return {
    posts,
    topContributors,
    loading,
    createPost,
    toggleLike,
    fetchComments,
    addComment,
    refreshPosts: fetchPosts,
  };
}