import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { registerUser } from '@/services/api';
import { useNavigate, Link } from 'react-router-dom';

const Register = () => {
    const [company_name, setCompanyName] = useState('');
    const [user_id, setUserId] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        if (localStorage.getItem('user_id')) {
            navigate('/dashboard');
        }
    }, [navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');
        try {
            await registerUser(company_name, user_id, password);
            setSuccess('Registration successful! Redirecting to login...');
            setTimeout(() => navigate('/login'), 1500);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#000000]">
            <Card className="w-full max-w-md shadow-2xl bg-card border border-border">
                <CardHeader>
                    <CardTitle className="text-center text-3xl mb-2 text-primary">Register</CardTitle>
                    <p className="text-center text-muted-foreground">Create your company account to get started.</p>
                </CardHeader>
                <form onSubmit={handleSubmit}>
                    <CardContent className="space-y-4">
                        <div>
                            <label className="block mb-1 text-sm font-medium text-foreground">Company Name</label>
                            <input
                                type="text"
                                className="w-full px-3 py-2 rounded bg-background text-foreground border border-input focus:outline-none focus:ring-2 focus:ring-primary/60"
                                value={company_name}
                                onChange={e => setCompanyName(e.target.value)}
                                required
                                autoFocus
                            />
                        </div>
                        <div>
                            <label className="block mb-1 text-sm font-medium text-foreground">User ID</label>
                            <input
                                type="text"
                                className="w-full px-3 py-2 rounded bg-background text-foreground border border-input focus:outline-none focus:ring-2 focus:ring-primary/60"
                                value={user_id}
                                onChange={e => setUserId(e.target.value)}
                                required
                            />
                        </div>
                        <div>
                            <label className="block mb-1 text-sm font-medium text-foreground">Password</label>
                            <input
                                type="password"
                                className="w-full px-3 py-2 rounded bg-background text-foreground border border-input focus:outline-none focus:ring-2 focus:ring-primary/60"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                required
                            />
                        </div>
                        {error && <div className="text-destructive text-sm text-center">{error}</div>}
                        {success && <div className="text-green-500 text-sm text-center">{success}</div>}
                    </CardContent>
                    <CardFooter className="flex flex-col gap-2">
                        <Button type="submit" className="w-full" disabled={loading}>
                            {loading ? 'Registering...' : 'Register'}
                        </Button>
                        <div className="text-center text-sm mt-2">
                            Already have an account?{' '}
                            <Link to="/login" className="text-primary underline hover:text-primary/80">Sign In</Link>
                        </div>
                    </CardFooter>
                </form>
            </Card>
        </div>
    );
};

export default Register; 