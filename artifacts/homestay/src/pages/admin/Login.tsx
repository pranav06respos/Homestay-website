import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAdminLogin } from '@workspace/api-client-react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/lib/authContext';
import { useTheme } from '@/hooks/useTheme';
import { Sun, Moon, Eye, EyeOff, KeyRound } from 'lucide-react';

const loginSchema = z.object({
  password: z.string().min(1, "Password is required"),
});

export default function AdminLogin() {
  const { toast } = useToast();
  const { setToken } = useAuth();
  const [, setLocation] = useLocation();
  const login = useAdminLogin();
  const { isDark, toggleTheme } = useTheme();
  const [showPassword, setShowPassword] = React.useState(false);

  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: { password: '' },
  });

  const onSubmit = async (values: z.infer<typeof loginSchema>) => {
    const trimmedPassword = values.password.trim();
    try {
      const res = await login.mutateAsync({ data: { password: trimmedPassword } });
      if (res.authenticated) {
        if (res.token) setToken(res.token);
        toast({ title: "Logged in successfully", description: "Welcome to the admin portal." });
        setLocation('/admin');
      } else {
        toast({ 
          title: "Invalid password", 
          description: "Please check your password and try again.", 
          variant: "destructive" 
        });
      }
    } catch (error: any) {
      console.error("Login attempt failed:", error);
      const status = error?.status || error?.response?.status;
      const errorMsg = String(error?.data?.error || error?.message || "");

      if (status === 401 || errorMsg.includes("401") || errorMsg.toLowerCase().includes("invalid password")) {
        toast({
          title: "Invalid password",
          description: "The password entered is incorrect. Please try again or use 'admin123'.",
          variant: "destructive",
        });
      } else if (status === 503) {
        toast({
          title: "Server setup required",
          description: "Admin password configuration missing on server.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Connection error",
          description: errorMsg || "Could not reach the server. Please check your internet connection.",
          variant: "destructive",
        });
      }
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-muted/20 relative p-4">
      <div className="absolute top-6 right-6">
        <Button
          variant="outline"
          size="sm"
          onClick={toggleTheme}
          className="gap-2 text-xs border-border bg-card hover:bg-muted"
          title={`Switch to ${isDark ? 'Light' : 'Dark'} Mode`}
        >
          {isDark ? (
            <>
              <Sun className="w-4 h-4 text-amber-400" />
              <span>Light Mode</span>
            </>
          ) : (
            <>
              <Moon className="w-4 h-4 text-muted-foreground" />
              <span>Dark Mode</span>
            </>
          )}
        </Button>
      </div>
      <div className="mb-8 text-center">
        <h1 className="font-serif text-4xl text-primary mb-2">Neel Kamal Homestay</h1>
        <p className="text-xs tracking-[0.3em] font-medium uppercase text-muted-foreground">KASAULI · Admin Portal</p>
      </div>

      <div className="w-full max-w-md bg-card p-8 rounded-sm shadow-sm border border-border">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="uppercase tracking-widest text-xs flex items-center justify-between">
                    <span>Admin Password</span>
                    <span className="text-[10px] text-muted-foreground font-normal lowercase tracking-normal">
                      default: admin123
                    </span>
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input 
                        type={showPassword ? "text" : "password"} 
                        autoComplete="current-password" 
                        placeholder="Enter password" 
                        className="pr-10"
                        {...field} 
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(prev => !prev)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                        tabIndex={-1}
                        title={showPassword ? "Hide password" : "Show password"}
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button 
              type="submit" 
              className="w-full h-12 uppercase tracking-widest text-sm font-medium gap-2" 
              disabled={login.isPending}
            >
              <KeyRound className="w-4 h-4" />
              {login.isPending ? 'Authenticating...' : 'Sign In'}
            </Button>
            <div className="text-center">
              <p className="text-xs text-muted-foreground">
                Tip: You can use <code className="bg-muted px-1.5 py-0.5 rounded text-foreground font-mono">admin123</code> to sign in.
              </p>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}