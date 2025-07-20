import { useState } from "react";
import { Button } from "./button";
import { Input } from "./input";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./dialog";
import { Mail, MessageSquare } from "lucide-react";

export function EmailDialog({ open, onOpenChange, onEmailSubmit }) {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await onEmailSubmit(email);
      setEmail("");
    } catch (error) {
      console.error("Email submission failed:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isValidEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <MessageSquare className="w-5 h-5 text-white" />
            </div>
            <div>
              <DialogTitle>Continue Your Marketing Analysis</DialogTitle>
              <DialogDescription className="mt-1">
                Save your conversation and ask follow-up questions
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Mail className="w-5 h-5 text-blue-600 mt-0.5" />
              <div className="text-sm text-blue-800">
                <p className="font-medium mb-1">Why do we need your email?</p>
                <ul className="space-y-1 text-xs">
                  <li>• Save your marketing conversations</li>
                  <li>• Continue analysis across sessions</li>
                  <li>• No spam, just your saved insights</li>
                </ul>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Input
                type="email"
                placeholder="Enter your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isSubmitting}
                className="w-full"
              />
            </div>
            
            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={!isValidEmail(email) || isSubmitting}
                className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                {isSubmitting ? "Starting..." : "Start Chat"}
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
} 