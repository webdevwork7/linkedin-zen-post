import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

const VALID_EMAIL = "admin@gmail.com";
const VALID_PASS = "admin@123";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (email === VALID_EMAIL && password === VALID_PASS) {
        localStorage.setItem("auth", "true");
        localStorage.setItem("auth_email", email);
        toast({ title: "✅ Logged in", description: "Welcome back!" });
        navigate("/");
      } else {
        toast({ title: "Invalid credentials", description: "Please check your email and password.", variant: "destructive" });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <Card className="p-6 w-full max-w-sm shadow-lg">
          <h1 className="text-xl font-bold mb-4 text-foreground">Sign In</h1>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-foreground">Email</Label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="bg-card border-border"
                required
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-foreground">Password</Label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="bg-card border-border"
                required
              />
            </div>
            <Button type="submit" disabled={isSubmitting} className="w-full bg-primary hover:bg-primary-hover">
              {isSubmitting ? "Signing in..." : "Sign In"}
            </Button>
            <p className="text-xs text-muted-foreground mt-2">Use admin@gmail.com / admin@123</p>
          </form>
        </Card>
      </motion.div>
    </div>
  );
};

export default Login;