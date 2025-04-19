import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, CheckCircle, XCircle, Mail } from 'lucide-react';
import { toast } from 'sonner';

const VerifyEmail: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState(false);
  const [resending, setResending] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState<'pending' | 'success' | 'error'>('pending');

  useEffect(() => {
    const checkVerification = async () => {
      const token = searchParams.get('token');
      const type = searchParams.get('type');

      if (token && type === 'email_verification') {
        setVerifying(true);
        try {
          const { error } = await supabase.auth.verifyOtp({
            token_hash: token,
            type: 'email',
          });

          if (error) {
            console.error('Verification error:', error);
            setVerificationStatus('error');
            toast.error('Email verification failed. Please try again.');
          } else {
            setVerificationStatus('success');
            toast.success('Email verified successfully!');
            // Redirect to dashboard after successful verification
            setTimeout(() => {
              navigate('/dashboard');
            }, 2000);
          }
        } catch (error) {
          console.error('Verification error:', error);
          setVerificationStatus('error');
          toast.error('An unexpected error occurred.');
        } finally {
          setVerifying(false);
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };

    checkVerification();
  }, [searchParams, navigate]);

  const handleResendVerification = async () => {
    setResending(true);
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: searchParams.get('email') || '',
      });

      if (error) {
        console.error('Resend error:', error);
        toast.error('Failed to resend verification email.');
      } else {
        toast.success('Verification email resent successfully!');
      }
    } catch (error) {
      console.error('Resend error:', error);
      toast.error('An unexpected error occurred.');
    } finally {
      setResending(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container flex items-center justify-center min-h-screen py-12">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">Email Verification</CardTitle>
          <CardDescription className="text-center">
            {verifying
              ? 'Verifying your email...'
              : verificationStatus === 'success'
              ? 'Your email has been verified!'
              : verificationStatus === 'error'
              ? 'Email verification failed'
              : 'Please verify your email address'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {verifying ? (
            <div className="flex flex-col items-center justify-center space-y-4">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
              <p className="text-muted-foreground">Verifying your email address...</p>
            </div>
          ) : verificationStatus === 'success' ? (
            <Alert className="bg-green-50 border-green-200">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <AlertTitle className="text-green-800">Verification Successful</AlertTitle>
              <AlertDescription className="text-green-700">
                Your email has been verified successfully. You will be redirected to the dashboard shortly.
              </AlertDescription>
            </Alert>
          ) : verificationStatus === 'error' ? (
            <Alert className="bg-red-50 border-red-200">
              <XCircle className="h-5 w-5 text-red-600" />
              <AlertTitle className="text-red-800">Verification Failed</AlertTitle>
              <AlertDescription className="text-red-700">
                There was an error verifying your email. Please try again or contact support if the problem persists.
              </AlertDescription>
            </Alert>
          ) : (
            <Alert>
              <Mail className="h-5 w-5" />
              <AlertTitle>Check Your Email</AlertTitle>
              <AlertDescription>
                We've sent a verification link to your email address. Please click the link to verify your account.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          {verificationStatus === 'error' && (
            <Button
              variant="outline"
              className="w-full"
              onClick={handleResendVerification}
              disabled={resending}
            >
              {resending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Resending...
                </>
              ) : (
                <>
                  <Mail className="mr-2 h-4 w-4" />
                  Resend Verification Email
                </>
              )}
            </Button>
          )}
          <Button
            variant="ghost"
            className="w-full"
            onClick={() => navigate('/auth')}
          >
            Back to Login
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default VerifyEmail; 