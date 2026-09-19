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
import { Sun, Moon } from 'lucide-react';

const loginSchema = z.object({
  password: z.string().min(1, "Password is required"),
});

export default function AdminLogin() {
  const { toast } = useToast();
  const { setToken } = useAuth();
  const [, setLocation] = useLocation();
  const login = useAdminLogin();
  const { isDark, toggleTheme } = useTheme();

  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: { password: '' },
  });

  const onSubmit = async (values: z.infer<typeof loginSchema>) => {
    try {
      const res = await login.mutateAsync({ data: { password: values.password } });
      if (res.authenticated) {
        // Store JWT in memory if provided (new JWT auth)
        if (res.token) setToken(res.token);
        toast({ title: "Logged in successfully" });
        // Navigate to admin dashboard via wouter (SPA nav preserves AuthContext)
        setLocation('/admin');
      } else {
        toast({ title: "Invalid password", variant: "destructive" });
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to sign in";
      toast({
        title: message.includes("401") ? "Invalid password" : "Unable to sign in",
        description: message.includes("401") ? undefined : "Please try again in a moment.",
        variant: "destructive",
      });
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
                  <FormLabel className="uppercase tracking-widest text-xs">Admin Password</FormLabel>
                  <FormControl>
                    <Input type="password" autoComplete="current-password" placeholder="Enter password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button 
              type="submit" 
              className="w-full h-12 uppercase tracking-widest text-sm font-medium" 
              disabled={login.isPending}
            >
              {login.isPending ? 'Authenticating...' : 'Sign In'}
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
}