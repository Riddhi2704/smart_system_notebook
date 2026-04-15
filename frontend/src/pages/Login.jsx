import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogIn, Eye, EyeOff, ClipboardList, ArrowRight, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import api from '../api';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    // 🚀 Server Wake-up (Fix for Render Cold Start)
    React.useEffect(() => {
        api.get('/health').catch(() => {}); // Silent ping
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            const result = await login(email, password);
            if (result.success) {
                navigate('/');
            } else {
                setError(result.message || 'Invalid email or password');
            }
        } catch (err) {
            setError('Something went wrong. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="auth-page-wrapper">
            <motion.div 
                className="auth-card"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, cubicBezier: [0.16, 1, 0.3, 1] }}
            >
                <div className="auth-header">
                    <motion.div 
                        className="auth-logo-badge"
                        initial={{ scale: 0.5, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                    >
                        <ClipboardList size={32} />
                    </motion.div>
                    <motion.h1 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                    >
                        Welcome Back
                    </motion.h1>
                    <motion.p 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                    >
                        Login to your account to continue
                    </motion.p>
                </div>

                {error && (
                    <motion.div 
                        className="auth-error"
                        initial={{ scale: 0.95, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                    >
                        {error}
                    </motion.div>
                )}

                <form onSubmit={handleSubmit}>
                    <motion.div 
                        className="auth-form-group"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.5 }}
                    >
                        <input
                            type="email"
                            className="auth-input"
                            placeholder="Email address"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </motion.div>
                    <motion.div 
                        className="auth-form-group"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.6 }}
                    >
                        <input
                            type={showPassword ? "text" : "password"}
                            className="auth-input"
                            placeholder="Password"
                            style={{ paddingRight: '52px' }}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                        <button 
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            style={{ 
                                position: 'absolute', 
                                right: '16px', 
                                top: '50%', 
                                transform: 'translateY(-50%)', 
                                color: '#94a3b8',
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer'
                            }}
                        >
                            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                        </button>
                    </motion.div>

                    <motion.button 
                        type="submit" 
                        className="auth-btn" 
                        disabled={isLoading}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.7 }}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                    >
                        {isLoading ? (
                            <>
                                <Loader2 size={20} className="animate-spin" />
                                <span>Securing session...</span>
                            </>
                        ) : (
                            <>
                                <span>Sign In</span>
                                <ArrowRight size={18} />
                            </>
                        )}
                    </motion.button>

                    <motion.div 
                        className="auth-footer"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.8 }}
                    >
                        Don't have an account? <Link to="/register" className="auth-link">Sign up now</Link>
                    </motion.div>
                </form>
            </motion.div>
        </div>
    );
};

export default Login;
