import { Share2, Copy, Check } from "lucide-react";
import { SiFacebook, SiX, SiWhatsapp } from "react-icons/si";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

interface ShareButtonProps {
  title: string;
  text: string;
  url: string;
  size?: "default" | "sm" | "lg" | "icon";
  variant?: "default" | "outline" | "ghost" | "secondary";
}

const isMobileDevice = () => {
  if (typeof navigator === 'undefined') return false;
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
};

export default function ShareButton({ 
  title, 
  text, 
  url,
  size = "default",
  variant = "outline"
}: ShareButtonProps) {
  const [copied, setCopied] = useState(false);
  const [hasNativeShare, setHasNativeShare] = useState(() => 
    typeof navigator !== 'undefined' && !!navigator.share && isMobileDevice()
  );
  const { toast } = useToast();

  useEffect(() => {
    setHasNativeShare(typeof navigator !== 'undefined' && !!navigator.share && isMobileDevice());
  }, []);

  const handleNativeShare = async () => {
    try {
      await navigator.share({
        title,
        text,
        url,
      });
    } catch (error) {
      if ((error as Error).name !== 'AbortError') {
        console.error('Error sharing:', error);
        toast({
          title: "Unable to share",
          description: "Could not open the share dialog. Please try again.",
          variant: "destructive",
        });
      }
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast({
        title: "Link copied!",
        description: "The link has been copied to your clipboard.",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Error copying:', error);
      toast({
        title: "Failed to copy",
        description: "Could not copy link to clipboard.",
        variant: "destructive",
      });
    }
  };

  const handleFacebookShare = () => {
    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
    window.open(facebookUrl, '_blank', 'noopener,noreferrer,width=600,height=400');
  };

  const handleTwitterShare = () => {
    const twitterUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`;
    window.open(twitterUrl, '_blank', 'noopener,noreferrer,width=600,height=400');
  };

  const handleWhatsAppShare = () => {
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`;
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
  };

  if (hasNativeShare) {
    return (
      <Button
        variant={variant}
        size={size}
        onClick={handleNativeShare}
        data-testid="button-share"
      >
        <Share2 className="h-4 w-4 mr-2" />
        Share
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant={variant} size={size} data-testid="button-share">
          <Share2 className="h-4 w-4 mr-2" />
          Share
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem onClick={handleCopyLink} data-testid="menu-item-copy-link">
          <div className="h-4 w-4 mr-2 relative">
            <Copy 
              className={`h-4 w-4 absolute transition-all duration-300 ${
                copied ? 'opacity-0 scale-0 rotate-90' : 'opacity-100 scale-100 rotate-0'
              }`}
            />
            <Check 
              className={`h-4 w-4 absolute text-green-600 dark:text-green-400 transition-all duration-300 ${
                copied ? 'opacity-100 scale-100 rotate-0' : 'opacity-0 scale-0 -rotate-90'
              }`}
            />
          </div>
          {copied ? 'Copied!' : 'Copy Link'}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleFacebookShare} data-testid="menu-item-facebook">
          <SiFacebook className="h-4 w-4 mr-2" />
          Facebook
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleTwitterShare} data-testid="menu-item-twitter">
          <SiX className="h-4 w-4 mr-2" />
          X (Twitter)
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleWhatsAppShare} data-testid="menu-item-whatsapp">
          <SiWhatsapp className="h-4 w-4 mr-2" />
          WhatsApp
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
