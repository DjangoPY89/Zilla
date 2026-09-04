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
                    if (data && data.url) {
                        window.location.href = data.url;
                        return { success: true, data: data };
                    }
                    return { success: true, data: data };
                } catch (error) {
                    console.error("[Supabase Google Auth Error]:", error);
                    return { success: false, error: error.message };
                }
            }

            return {
                success: false,
                error: "Configuración de Supabase incompleta. Por favor proporciona la clave anon public."
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
                    if (data && data.url) {
                        window.location.href = data.url;
                        return { success: true, data: data };
                    }
                    return { success: true, data: data };
                } catch (error) {
                    console.error("[Supabase Facebook Auth Error]:", error);
                    return { success: false, error: error.message };
                }
            }

            return {
                success: false,
                error: "Configuración de Supabase incompleta. Por favor proporciona la clave anon public."
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
         * Asegurar que el usuario tenga un registro en public.profiles (Google/Facebook/Email)
         */
        ensureProfile: async function (user) {
            if (supabaseClient && !isMockMode && user && user.id) {
                try {
                    const fullName = user.user_metadata?.full_name || user.user_metadata?.name || (user.email ? user.email.split('@')[0] : 'Usuario');
                    const avatar = user.user_metadata?.avatar_url || user.user_metadata?.picture || null;
                    const provider = user.app_metadata?.provider || 'google';

                    await supabaseClient.from('profiles').upsert({
                        id: user.id,
                        email: user.email,
                        full_name: fullName,
                        avatar_url: avatar,
                        auth_provider: provider,
                        updated_at: new Date().toISOString()
                    }, { onConflict: 'id' });
                    console.info("[Zilla Supabase] Perfil verificado/creado exitosamente en public.profiles para:", user.email);
                } catch (e) {
                    console.warn("[Zilla Supabase] Error asegurando perfil en base de datos:", e);
                }
            }
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
