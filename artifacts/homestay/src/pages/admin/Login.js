import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useLocation } from 'wouter';
import { useAdminLogin } from '@workspace/api-client-react';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
const loginSchema = z.object({
    password: z.string().min(1, "Password is required"),
});
export default function AdminLogin() {
    const [, setLocation] = useLocation();
    const { toast } = useToast();
    const login = useAdminLogin();
    const form = useForm({
        resolver: zodResolver(loginSchema),
        defaultValues: { password: '' },
    });
    const onSubmit = async (values) => {
        try {
            const res = await login.mutateAsync({ data: { password: values.password } });
            if (res.authenticated) {
                toast({ title: "Logged in successfully" });
                setLocation('/admin');
            }
            else {
                toast({ title: "Invalid password", variant: "destructive" });
            }
        }
        catch (error) {
            const message = error instanceof Error ? error.message : "Unable to sign in";
            toast({
                title: message.includes("401") ? "Invalid password" : "Unable to sign in",
                description: message.includes("401") ? undefined : "Please try again in a moment.",
                variant: "destructive",
            });
        }
    };
    return (_jsxs("div", { className: "min-h-screen flex flex-col items-center justify-center bg-muted/20", children: [_jsxs("div", { className: "mb-8 text-center", children: [_jsx("h1", { className: "font-serif text-4xl text-primary mb-2", children: "Neel Kamal Homestay" }), _jsx("p", { className: "text-xs tracking-[0.3em] font-medium uppercase text-muted-foreground", children: "KASAULI \u00B7 Admin Portal" })] }), _jsx("div", { className: "w-full max-w-md bg-card p-8 rounded-sm shadow-sm border border-border", children: _jsx(Form, { ...form, children: _jsxs("form", { onSubmit: form.handleSubmit(onSubmit), className: "space-y-6", children: [_jsx(FormField, { control: form.control, name: "password", render: ({ field }) => (_jsxs(FormItem, { children: [_jsx(FormLabel, { className: "uppercase tracking-widest text-xs", children: "Admin Password" }), _jsx(FormControl, { children: _jsx(Input, { type: "password", autoComplete: "current-password", placeholder: "Enter password", ...field }) }), _jsx(FormMessage, {})] })) }), _jsx(Button, { type: "submit", className: "w-full h-12 uppercase tracking-widest text-sm font-medium", disabled: login.isPending, children: login.isPending ? 'Authenticating...' : 'Sign In' })] }) }) })] }));
}
