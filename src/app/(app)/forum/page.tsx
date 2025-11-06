'use client';

import { Heart, MessageSquare, Send } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

type Post = {
  id: number;
  author: string;
  avatar: string;
  initial: string;
  message: string;
  likes: number;
  replies: { author: string; message: string }[];
};

const initialForumPosts: Post[] = [
  {
    id: 1,
    author: 'Alex',
    avatar: 'https://i.pravatar.cc/150?u=a042581f4e29026704d',
    initial: 'A',
    message: "Just hit 7 days, feeling proud but the cravings are tough today. Any tips?",
    likes: 12,
    replies: [
      { author: 'Jane', message: "You've got this, Alex! Try a short walk." },
      { author: 'Sam', message: 'Congrats on 7 days! That is huge.' },
    ],
  },
  {
    id: 2,
    author: 'Maria',
    avatar: 'https://i.pravatar.cc/150?u=a042581f4e29026704e',
    initial: 'M',
    message: "Feeling a bit down today, but reading through everyone's stories is helping a lot.",
    likes: 25,
    replies: [],
  },
];


export default function ForumPage() {
  const { toast } = useToast();
  const [posts, setPosts] = useState(initialForumPosts);
  const [newMessage, setNewMessage] = useState("");

  const handlePost = () => {
    if (!newMessage.trim()) return;
    toast({
        title: "Message Posted!",
        description: "Your message has been shared with the community."
    });
    setNewMessage("");
  }

  return (
    <div className="p-4 space-y-6 animate-in fade-in-0 slide-in-from-bottom-4 duration-500">
      <header>
        <h1 className="text-2xl font-bold font-headline">Community Forum</h1>
        <p className="text-muted-foreground">
          Share your journey and connect with others. You are not alone.
        </p>
      </header>

      <Card className="animate-in fade-in-0 slide-in-from-bottom-4 duration-500 delay-100 fill-mode-both">
        <CardContent className="p-4">
          <div className="flex gap-2">
            <Input 
                placeholder="Share something with the group..." 
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
            />
            <Button size="icon" onClick={handlePost}>
              <Send />
            </Button>
          </div>
        </CardContent>
      </Card>
      
      <div className="space-y-4">
        {posts.map((post, index) => (
          <Card key={post.id} className="animate-in fade-in-0 slide-in-from-bottom-4 duration-500 fill-mode-both" style={{animationDelay: `${200 + index * 100}ms`}}>
            <CardHeader className="p-4">
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarImage src={post.avatar} alt={post.author} />
                  <AvatarFallback>{post.initial}</AvatarFallback>
                </Avatar>
                <p className="font-semibold">{post.author}</p>
              </div>
            </CardHeader>
            <CardContent className="px-4 pb-2">
              <p className="text-foreground/90">{post.message}</p>
            </CardContent>
            <CardFooter className="p-4 flex justify-between">
                <div className="flex gap-4">
                     <Button variant="ghost" size="sm" className="flex items-center gap-2">
                        <Heart className="h-4 w-4" /> 
                        <span>{post.likes}</span>
                    </Button>
                     <Button variant="ghost" size="sm" className="flex items-center gap-2">
                        <MessageSquare className="h-4 w-4" /> 
                        <span>{post.replies.length}</span>
                    </Button>
                </div>
            </CardFooter>
            {post.replies.length > 0 && (
                <div className="px-4 pb-4">
                    <Separator className="my-2"/>
                    <div className="space-y-3 pt-2 pl-4 border-l-2 ml-2">
                        {post.replies.map((reply, index) => (
                            <div key={index}>
                                <p className="text-sm font-semibold">{reply.author}</p>
                                <p className="text-sm text-muted-foreground">{reply.message}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}
