/**
 * ============================================================
 * ZILLA PARAGUAY - CLIENTE & CONFIGURACIÓN SUPABASE
 * Conexión Centralizada con Supabase Auth, PostgreSQL y OAuth (Google/Facebook)
 * ============================================================
 */

(function () {
    'use strict';

    // 1. Configuración de Credenciales de Supabase
    const SUPABASE_URL = window.SUPABASE_CUSTOM_URL || 'https://chzxwihqmvotxhiztehk.supabase.co';
    const SUPABASE_ANON_KEY = window.SUPABASE_CUSTOM_KEY || 'sb_publishable_45-h_r-q0fhiQoQ4Xgz8ZA_ep_fCnp0';

    let supabaseClient = null;
    let isMockMode = false;

    // Verificar si la clave es real o está vacía/placeholder
    const isRealKey = SUPABASE_ANON_KEY && 
                      !SUPABASE_ANON_KEY.includes('placeholder') && 
                      SUPABASE_ANON_KEY.length > 15;

    // 2. Inicializar Cliente Supabase
    if (window.supabase && typeof window.supabase.createClient === 'function' && isRealKey) {
        try {
            supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
                auth: {
                    autoRefreshToken: true,
                    persistSession: true,
                    detectSessionInUrl: true,
                    storage: window.localStorage
                }
            });
            console.info("[Zilla Supabase] Conectado exitosamente a Supabase Cloud:", SUPABASE_URL);
        } catch (err) {
            console.warn("[Zilla Supabase] Error al inicializar cliente real:", err);
            isMockMode = true;
        }
    } else {
        isMockMode = true;
        console.info("[Zilla Supabase] Operando en modo local/desarrollo.");
    }



    // 3. API de Autenticación y Base de Datos de Clientes
    const ZillaSupabase = {
        client: supabaseClient,
        isMockMode: isMockMode,

        /**
         * Obtener URL de redirección actual para OAuth
         */
        getRedirectUrl: function () {
            const origin = window.location.origin || (window.location.protocol + '//' + window.location.host);
            // Si estamos en un path o subdirectorio
            const pathname = window.location.pathname;
            const dir = pathname.substring(0, pathname.lastIndexOf('/') + 1);
            return `${origin}${dir}dashboard.html`;
        },

        /**
         * Iniciar Sesión con Correo y Contraseña
         */
        signInWithEmail: async function (email, password) {
            if (supabaseClient && !isMockMode) {
                try {
                    const { data, error } = await supabaseClient.auth.signInWithPassword({
                        email: email,
                        password: password
                    });
                    if (error) throw error;
                    return { success: true, user: data.user, session: data.session };
                } catch (error) {
                    console.error("[Supabase Login Error]:", error);
                    return { success: false, error: error.message };
                }
            }

            // Fallback Mock Local
            const username = email.split('@')[0];
            return {
                success: true,
                user: {
                    id: 'usr_' + Date.now(),
                    email: email,
                    user_metadata: {
                        full_name: username.charAt(0).toUpperCase() + username.slice(1)
                    }
                }
            };
        },

        /**
         * Registrarse con Correo, Contraseña y Nombre
         */
        signUpWithEmail: async function (email, password, fullName, phone) {
            if (supabaseClient && !isMockMode) {
                try {
                    const { data, error } = await supabaseClient.auth.signUp({
                        email: email,
                        password: password,
                        options: {
                            data: {
                                full_name: fullName,
                                phone: phone || null,
                                role: 'client'
                            }
                        }
                    });
                    if (error) throw error;
                    return { success: true, user: data.user, session: data.session };
                } catch (error) {
                    console.error("[Supabase SignUp Error]:", error);
                    return { success: false, error: error.message };
                }
            }

            // Fallback Mock Local
            return {
                success: true,
                user: {
                    id: 'usr_' + Date.now(),
                    email: email,
                    user_metadata: {
                        full_name: fullName || email.split('@')[0]
                    }
                }
            };
        },

        /**
         * Iniciar Sesión con Google OAuth
         */
        signInWithGoogle: async function () {
            const redirectUrl = this.getRedirectUrl();
            if (supabaseClient && !isMockMode) {
                try {
                    const { data, error } = await supabaseClient.auth.signInWithOAuth({
                        provider: 'google',
                        options: {
                            redirectTo: redirectUrl,
                            queryParams: {
                                access_type: 'offline',
                                prompt: 'consent'
                            }
                        }
                    });
                    if (error) throw error;
                    return { success: true, data: data };
                } catch (error) {
                    console.error("[Supabase Google Auth Error]:", error);
                    return { success: false, error: error.message };
                }
            }

            // Fallback Mock Local Dinámico
            const inputEmail = document.getElementById('auth-email-input')?.value || '';
            const fallbackEmail = inputEmail || `usuario.google.${Date.now().toString().slice(-4)}@gmail.com`;
            const nameFromEmail = fallbackEmail.split('@')[0];
            const fallbackName = nameFromEmail.charAt(0).toUpperCase() + nameFromEmail.slice(1);

            return {
                success: true,
                user: {
                    id: 'usr_google_' + Date.now(),
                    email: fallbackEmail,
                    user_metadata: {
                        full_name: fallbackName,
                        avatar_url: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=300&q=80'
                    }
                }
            };
        },

        /**
         * Iniciar Sesión con Facebook OAuth
         */
        signInWithFacebook: async function () {
            const redirectUrl = this.getRedirectUrl();
            if (supabaseClient && !isMockMode) {
                try {
                    const { data, error } = await supabaseClient.auth.signInWithOAuth({
                        provider: 'facebook',
                        options: {
                            redirectTo: redirectUrl,
                            scopes: 'email,public_profile'
                        }
                    });
                    if (error) throw error;
                    return { success: true, data: data };
                } catch (error) {
                    console.error("[Supabase Facebook Auth Error]:", error);
                    return { success: false, error: error.message };
                }
            }

            // Fallback Mock Local Dinámico
            const inputEmail = document.getElementById('auth-email-input')?.value || '';
            const fallbackEmail = inputEmail || `usuario.fb.${Date.now().toString().slice(-4)}@facebook.com`;
            const nameFromEmail = fallbackEmail.split('@')[0];
            const fallbackName = nameFromEmail.charAt(0).toUpperCase() + nameFromEmail.slice(1);

            return {
                success: true,
                user: {
                    id: 'usr_facebook_' + Date.now(),
                    email: fallbackEmail,
                    user_metadata: {
                        full_name: fallbackName,
                        avatar_url: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=300&q=80'
                    }
                }
            };
        },


        /**
         * Cerrar Sesión
         */
        signOut: async function () {
            if (supabaseClient && !isMockMode) {
                try {
                    await supabaseClient.auth.signOut();
                } catch (e) {
                    console.warn("Error al cerrar sesión en Supabase:", e);
                }
            }
            localStorage.removeItem('zilla_user_session');
            return { success: true };
        },

        /**
         * Obtener Perfil del Cliente desde public.profiles
         */
        getProfile: async function (userId) {
            if (supabaseClient && !isMockMode && userId) {
                try {
                    const { data, error } = await supabaseClient
                        .from('profiles')
                        .select('*')
                        .eq('id', userId)
                        .single();
                    if (error) throw error;
                    return { success: true, profile: data };
                } catch (error) {
                    console.warn("Error al cargar perfil de Supabase:", error);
                }
            }
            return { success: false };
        },

        /**
         * Actualizar Perfil del Cliente en public.profiles
         */
        updateProfile: async function (userId, updates) {
            if (supabaseClient && !isMockMode && userId) {
                try {
                    const { data, error } = await supabaseClient
                        .from('profiles')
                        .update(updates)
                        .eq('id', userId);
                    if (error) throw error;
                    return { success: true, data: data };
                } catch (error) {
                    console.error("Error al actualizar perfil en Supabase:", error);
                    return { success: false, error: error.message };
                }
            }
            return { success: true, updates: updates };
        }
    };

    // Exponer globalmente
    window.ZillaSupabase = ZillaSupabase;

})();
