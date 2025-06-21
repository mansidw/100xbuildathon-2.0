import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { loginUser } from '@/services/api';
import { useNavigate, Link } from 'react-router-dom';

const Login = () => {
    const [user_id, setUserId] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        if (localStorage.getItem('user_id')) {
            navigate('/chat');
        }
    }, [navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            await loginUser(user_id, password);
            localStorage.setItem('user_id', user_id);
            navigate('/chat');
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#000000] font-['Poppins']">
            <Card className="w-full max-w-md shadow-2xl bg-card border border-border">
                <CardHeader>
                    <CardTitle className="text-center text-3xl mb-2 text-primary">Sign In</CardTitle>
                    <p className="text-center text-muted-foreground">Welcome back! Please login to your account.</p>
                </CardHeader>
                <form onSubmit={handleSubmit}>
                    <CardContent className="space-y-4">
                        <div>
                            <label className="block mb-1 text-sm font-medium text-foreground">User ID</label>
                            <input
                                type="text"
                                className="w-full px-3 py-2 rounded bg-background text-foreground border border-input focus:outline-none focus:ring-2 focus:ring-primary/60"
                                value={user_id}
                                onChange={e => setUserId(e.target.value)}
                                required
                                autoFocus
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
                    </CardContent>
                    <CardFooter className="flex flex-col gap-2">
                        <Button type="submit" className="w-full" disabled={loading}>
                            {loading ? 'Signing in...' : 'Sign In'}
                        </Button>
                        <div className="text-center text-sm mt-2">
                            Don&apos;t have an account?{' '}
                            <Link to="/register" className="text-primary underline hover:text-primary/80">Register</Link>
                        </div>
                    </CardFooter>
                </form>
            </Card>
        </div>
    );
};

export default Login; 