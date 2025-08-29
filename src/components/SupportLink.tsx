import React from 'react';
import { Button } from '@/components/ui/button';
import { ExternalLink } from 'lucide-react';

interface SupportLinkProps {
  href: string;
  children: React.ReactNode;
  external?: boolean;
}

export function SupportLink({ href, children, external = false }: SupportLinkProps) {
  const handleClick = () => {
    if (external) {
      window.open(href, '_blank', 'noopener,noreferrer');
    } else {
      // For internal links, you could use navigate here
      window.location.href = href;
    }
  };

  return (
    <Button 
      variant="ghost" 
      className="w-full justify-start"
      onClick={handleClick}
    >
      {children}
      {external && <ExternalLink className="w-4 h-4 ml-auto" />}
    </Button>
  );
}