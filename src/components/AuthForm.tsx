import React, { useState } from "react";
import { Eye, EyeOff, ArrowRight, Lock, Mail, User, Building } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from '../contexts/AuthContext';
import { useUser } from '../contexts/UserContext';
import { Database } from '../types/database.types';

type Profile = Database['public']['Tables']['profiles']['Row'];

interface AuthFormProps {
  mode: 'signin' | 'signup';
  onToggleMode: () => void;
}

const AuthForm: React.FC<AuthFormProps> = ({ mode, onToggleMode }) => {
  const navigate = useNavigate();
  const { signIn, signUp, user } = useAuth();
  const { updateProfile, createProfile } = useUser();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    full_name: '',
    company: '',
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (mode === 'signup') {
        console.log('Starting signup process with email:', formData.email);
        
        // Sign up the user with metadata
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: {
            data: {
              full_name: formData.full_name,
              company: formData.company,
              role: 'user'
            }
          }
        });
        
        if (signUpError) {
          console.error('Signup error:', signUpError);
          throw signUpError;
        }
        
        console.log('Signup response:', signUpData);
        
        // Check if email confirmation is required
        if (signUpData.user && !signUpData.user.confirmed_at) {
          console.log('Email confirmation required');
          toast.success('Please check your email to confirm your account');
          navigate('/auth/verify-email');
          return;
        }
        
        // If we get here, the user is already confirmed
        toast.success('Account created successfully!');
        navigate('/dashboard');
      } else {
        await signIn(formData.email, formData.password);
        toast.success('Signed in successfully!');
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('Error in handleSubmit:', error);
      toast.error((error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleSocialLogin = async (provider: 'google' | 'linkedin') => {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) throw error;
    } catch (error: any) {
      toast.error(`Error signing in with ${provider}: ${error.message}`);
    }
  };

  const handleForgotPassword = async () => {
    if (!formData.email) {
      toast.error("Please enter your email address");
      return;
    }

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(formData.email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });

      if (error) throw error;

      toast.success("Password reset instructions have been sent to your email");
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  return (
    <div className="w-full max-w-md mx-auto glass-card p-8">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold mb-2">
          {mode === 'signup' ? "Create an Account" : "Welcome Back"}
        </h2>
        <p className="text-muted-foreground text-sm">
          {mode === 'signup'
            ? "Join thousands of fire engineers in South Africa"
            : "Sign in to your FireFly account"}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {mode === 'signup' && (
          <>
            <div className="space-y-2">
              <label htmlFor="full_name" className="text-sm font-medium">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <input
                  id="full_name"
                  name="full_name"
                  type="text"
                  value={formData.full_name}
                  onChange={handleChange}
                  className="input-field pl-10"
                  placeholder="Enter your full name"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="company" className="text-sm font-medium">
                Organization
              </label>
              <div className="relative">
                <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <input
                  id="company"
                  name="company"
                  type="text"
                  value={formData.company}
                  onChange={handleChange}
                  className="input-field pl-10"
                  placeholder="Your company or organization"
                  required
                />
              </div>
            </div>
          </>
        )}

        <div className="space-y-2">
          <label htmlFor="email" className="text-sm font-medium">
            Email
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              className="input-field pl-10"
              placeholder="name@example.com"
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between">
            <label htmlFor="password" className="text-sm font-medium">
              Password
            </label>
            {mode === 'signin' && (
              <button
                type="button"
                onClick={handleForgotPassword}
                className="text-sm text-primary hover:text-primary/80"
              >
                Forgot password?
              </button>
            )}
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              value={formData.password}
              onChange={handleChange}
              className="input-field pl-10"
              placeholder={mode === 'signup' ? "Create a password" : "Enter your password"}
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>

        <button
          type="submit"
          className="btn-primary w-full bg-fire text-white hover:bg-fire/90 flex items-center justify-center"
          disabled={loading}
        >
          {loading ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          ) : (
            <>
              {mode === 'signup' ? "Create Account" : "Sign In"}
              <ArrowRight className="ml-2 h-4 w-4" />
            </>
          )}
        </button>
      </form>

      <div className="mt-6 text-center text-sm">
        <span className="text-muted-foreground">
          {mode === 'signup' ? 'Already have an account?' : "Don't have an account?"}
        </span>{' '}
        <button
          type="button"
          onClick={onToggleMode}
          className="text-primary hover:text-primary/80 font-medium"
        >
          {mode === 'signup' ? 'Sign in' : 'Create an account'}
        </button>
      </div>
    </div>
  );
};

export default AuthForm;
