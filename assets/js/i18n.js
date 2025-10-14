/**
 * Sistema de Internacionalización (i18n) para Portfolio
 * Soporte para múltiples idiomas sin afectar funcionamiento estático
 */

class I18n {
    constructor() {
        this.currentLanguage = 'es'; // Idioma por defecto
        this.fallbackLanguage = 'en';
        this.translations = {};
        this.supportedLanguages = ['en', 'es'];
        this.init();
    }

    /**
     * Inicializa el sistema de internacionalización
     */
    async init() {
        try {
            // Detectar idioma usando prioridad establecida
            this.currentLanguage = this.detectLanguage();
            
            // Cargar traducciones
            await this.loadTranslations(this.currentLanguage);
            
            // Aplicar traducciones
            this.translatePage();
            
            // Configurar eventos de interactividad
            this.setupEventListeners();
            
            // Actualizar URL si es necesario
            this.updateURL();
            
        } catch (error) {
            console.warn('Error al inicializar i18n:', error);
            // En caso de error, usar idioma de fallback
            await this.loadTranslations(this.fallbackLanguage);
            this.translatePage();
        }
    }

    /**
     * Detecta el idioma a usar según prioridad:
     * 1. localStorage
     * 2. Parámetro URL
     * 3. Idioma del navegador
     * 4. Fallback a 'en'
     */
    detectLanguage() {
        // 1. Verificar localStorage
        const storedLang = localStorage.getItem('lang');
        if (storedLang && this.supportedLanguages.includes(storedLang)) {
            return storedLang;
        }

        // 2. Verificar parámetro URL
        const urlParams = new URLSearchParams(window.location.search);
        const urlLang = urlParams.get('lang');
        if (urlLang && this.supportedLanguages.includes(urlLang)) {
            return urlLang;
        }

        // 3. Verificar idioma del navegador
        const browserLang = navigator.language || navigator.userLanguage;
        const shortLang = browserLang.split('-')[0].toLowerCase();
        if (this.supportedLanguages.includes(shortLang)) {
            return shortLang;
        }

        // 4. Fallback
        return this.fallbackLanguage;
    }

    /**
     * Carga de forma asíncrona el archivo JSON de traducciones
     */
    async loadTranslations(language) {
        try {
            const response = await fetch(`./assets/i18n/${language}.json`);
            
            if (!response.ok) {
                throw new Error(`No se pudo cargar ${language}.json: ${response.status}`);
            }
            
            this.translations = await response.json();
            
        } catch (error) {
            console.error(`Error cargando traducciones para ${language}:`, error);
            
            // Si falla cargar el idioma solicitado, intentar con fallback
            if (language !== this.fallbackLanguage) {
                console.warn(`Fallback a idioma ${this.fallbackLanguage}`);
                const fallbackResponse = await fetch(`./assets/i18n/${this.fallbackLanguage}.json`);
                this.translations = await fallbackResponse.json();
                this.currentLanguage = this.fallbackLanguage;
            } else {
                throw error;
            }
        }
    }

    /**
     * Traduce todos los elementos del DOM que tienen data-i18n
     */
    translatePage() {
        // Actualizar atributo lang del HTML
        document.documentElement.lang = this.currentLanguage;

        // Buscar todos los elementos con data-i18n
        const elementsToTranslate = document.querySelectorAll('[data-i18n]');
        
        elementsToTranslate.forEach(element => {
            const key = element.getAttribute('data-i18n');
            const translation = this.getTranslation(key);
            
            if (translation) {
                if (typeof translation === 'string') {
                    // Verificar si la traducción contiene HTML
                    if (translation.includes('<') && translation.includes('>')) {
                        // Usar innerHTML para contenido HTML
                        element.innerHTML = translation;
                    } else {
                        // Usar textContent para texto plano
                        element.textContent = translation;
                    }
                } else if (typeof translation === 'object') {
                    // Traducción de atributos
                    Object.keys(translation).forEach(attr => {
                        if (attr === 'text') {
                            if (translation[attr].includes('<') && translation[attr].includes('>')) {
                                element.innerHTML = translation[attr];
                            } else {
                                element.textContent = translation[attr];
                            }
                        } else {
                            element.setAttribute(attr, translation[attr]);
                        }
                    });
                }
            } else {
                // Elemento no se pudo traducir - mantener contenido original si existe
                console.debug(`Elemento con data-i18n="${key}" no se pudo traducir, manteniendo contenido original`);
            }
        });

        // Traducir elementos con data-i18n-placeholder
        this.translatePlaceholders();

        // Traducir otros atributos específicos
        this.translateAttributes();

        // Actualizar elementos específicos que puedan requerir tratamiento especial
        this.updateSpecialElements();
    }

    /**
     * Traduce todos los elementos que tienen data-i18n-placeholder
     */
    translatePlaceholders() {
        const placeholderElements = document.querySelectorAll('[data-i18n-placeholder]');
        
        placeholderElements.forEach(element => {
            const key = element.getAttribute('data-i18n-placeholder');
            const translation = this.getTranslation(key);
            
            if (translation && typeof translation === 'string') {
                element.setAttribute('placeholder', translation);
            }
        });
    }

    /**
     * Traduce otros atributos específicos que pueden tener data-i18n-[attribute]
     */
    translateAttributes() {
        // Buscar elementos con atributos data-i18n-title
        const titleElements = document.querySelectorAll('[data-i18n-title]');
        titleElements.forEach(element => {
            const key = element.getAttribute('data-i18n-title');
            const translation = this.getTranslation(key);
            
            if (translation && typeof translation === 'string') {
                element.setAttribute('title', translation);
            }
        });

        // Buscar elementos con atributos data-i18n-alt
        const altElements = document.querySelectorAll('[data-i18n-alt]');
        altElements.forEach(element => {
            const key = element.getAttribute('data-i18n-alt');
            const translation = this.getTranslation(key);
            
            if (translation && typeof translation === 'string') {
                element.setAttribute('alt', translation);
            }
        });

        // Buscar elementos con atributos data-i18n-aria-label
        const ariaLabelElements = document.querySelectorAll('[data-i18n-aria-label]');
        ariaLabelElements.forEach(element => {
            const key = element.getAttribute('data-i18n-aria-label');
            const translation = this.getTranslation(key);
            
            if (translation && typeof translation === 'string') {
                element.setAttribute('aria-label', translation);
            }
        });
    }

    /**
     * Obtiene una traducción por su clave
     */
    getTranslation(key) {
        const keys = key.split('.');
        let translation = this.translations;
        
        for (const k of keys) {
            if (translation && typeof translation === 'object' && translation.hasOwnProperty(k)) {
                translation = translation[k];
            } else {
                console.warn(`Traducción no encontrada para: ${key} (falló en '${k}')`);
                console.debug('Traducciones disponibles en este nivel:', translation ? Object.keys(translation) : 'N/A');
                return null;
            }
        }
        
        return translation;
    }

    /**
     * Actualiza elementos especiales que requieren lógica adicional
     */
    updateSpecialElements() {
        // Actualizar meta tags
        const description = document.querySelector('meta[name="description"]');
        if (description) {
            const metaDesc = this.getTranslation('meta.description');
            if (metaDesc) description.setAttribute('content', metaDesc);
        }

        const keywords = document.querySelector('meta[name="keywords"]');
        if (keywords) {
            const metaKeywords = this.getTranslation('meta.keywords');
            if (metaKeywords) keywords.setAttribute('content', metaKeywords);
        }

        // Actualizar title
        const title = this.getTranslation('meta.title');
        if (title) document.title = title;

        // Actualizar Open Graph tags
        const ogTitle = document.querySelector('meta[property="og:title"]');
        if (ogTitle) {
            const ogTitleText = this.getTranslation('meta.og_title');
            if (ogTitleText) ogTitle.setAttribute('content', ogTitleText);
        }

        const ogDescription = document.querySelector('meta[property="og:description"]');
        if (ogDescription) {
            const ogDescText = this.getTranslation('meta.og_description');
            if (ogDescText) ogDescription.setAttribute('content', ogDescText);
        }

        // Actualizar Twitter Card
        const twitterTitle = document.querySelector('meta[name="twitter:title"]');
        if (twitterTitle) {
            const twitterTitleText = this.getTranslation('meta.twitter_title');
            if (twitterTitleText) twitterTitle.setAttribute('content', twitterTitleText);
        }

        const twitterDescription = document.querySelector('meta[name="twitter:description"]');
        if (twitterDescription) {
            const twitterDescText = this.getTranslation('meta.twitter_description');
            if (twitterDescText) twitterDescription.setAttribute('content', twitterDescText);
        }
    }

    /**
     * Configura los event listeners para el cambio de idioma
     */
    setupEventListeners() {
        // Buscar botón de cambio de idioma
        const langToggle = document.getElementById('lang-toggle');
        if (langToggle) {
            langToggle.addEventListener('click', () => {
                this.toggleLanguage();
            });
        }

        // También configurar cualquier otro botón con clase lang-switch
        const langSwitchers = document.querySelectorAll('.lang-switch');
        langSwitchers.forEach(switcher => {
            switcher.addEventListener('click', (e) => {
                const targetLang = e.target.getAttribute('data-lang');
                if (targetLang && this.supportedLanguages.includes(targetLang)) {
                    this.changeLanguage(targetLang);
                }
            });
        });
    }

    /**
     * Cambia entre los idiomas disponibles
     */
    async toggleLanguage() {
        const newLanguage = this.currentLanguage === 'en' ? 'es' : 'en';
        await this.changeLanguage(newLanguage);
    }

    /**
     * Cambia a un idioma específico
     */
    async changeLanguage(newLanguage) {
        if (!this.supportedLanguages.includes(newLanguage) || newLanguage === this.currentLanguage) {
            return;
        }

        try {
            // Mostrar indicador de carga si es necesario
            this.showLoadingIndicator();

            // Cargar nuevas traducciones
            await this.loadTranslations(newLanguage);
            
            // Actualizar idioma actual
            this.currentLanguage = newLanguage;
            
            // Guardar preferencia en localStorage
            localStorage.setItem('lang', newLanguage);
            
            // Actualizar URL sin recargar página
            this.updateURL();
            
            // Aplicar traducciones
            this.translatePage();
            
            // Actualizar botón de idioma si existe
            this.updateLanguageButton();
            
            // Ocultar indicador de carga
            this.hideLoadingIndicator();
            
        } catch (error) {
            console.error('Error al cambiar idioma:', error);
            this.hideLoadingIndicator();
        }
    }

    /**
     * Actualiza la URL con el parámetro de idioma sin recargar la página
     */
    updateURL() {
        const url = new URL(window.location);
        url.searchParams.set('lang', this.currentLanguage);
        window.history.replaceState({}, '', url);
    }

    /**
     * Actualiza el contenido del botón de idioma
     */
    updateLanguageButton() {
        const langToggle = document.getElementById('lang-toggle');
        const langToggleMobile = document.getElementById('lang-toggle-mobile');
        
        if (langToggle) {
            // Actualizar icono o texto del botón según el idioma actual
            const langText = this.currentLanguage === 'en' ? 'ES' : 'EN';
            langToggle.innerHTML = `<i class="fas fa-globe text-primary dark:text-primary-dark"></i> <span class="ml-1 text-sm font-semibold text-primary dark:text-primary-dark">${langText}</span>`;
        }
        
        if (langToggleMobile) {
            const langText = this.currentLanguage === 'en' ? 'ES' : 'EN';
            langToggleMobile.innerHTML = `<span class="text-xs font-semibold text-primary dark:text-primary-dark">${langText}</span>`;
        }
    }

    /**
     * Muestra un indicador de carga durante el cambio de idioma
     */
    showLoadingIndicator() {
        const langToggle = document.getElementById('lang-toggle');
        const langToggleMobile = document.getElementById('lang-toggle-mobile');
        
        if (langToggle) {
            langToggle.disabled = true;
            langToggle.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
        }
        
        if (langToggleMobile) {
            langToggleMobile.disabled = true;
            langToggleMobile.innerHTML = '<i class="fas fa-spinner fa-spin text-xs"></i>';
        }
    }

    /**
     * Oculta el indicador de carga
     */
    hideLoadingIndicator() {
        const langToggle = document.getElementById('lang-toggle');
        const langToggleMobile = document.getElementById('lang-toggle-mobile');
        
        if (langToggle) {
            langToggle.disabled = false;
        }
        
        if (langToggleMobile) {
            langToggleMobile.disabled = false;
        }
        
        this.updateLanguageButton();
    }

    /**
     * Obtiene el idioma actual
     */
    getCurrentLanguage() {
        return this.currentLanguage;
    }

    /**
     * Verifica si un idioma está soportado
     */
    isLanguageSupported(language) {
        return this.supportedLanguages.includes(language);
    }

    /**
     * Obtiene la lista de idiomas soportados
     */
    getSupportedLanguages() {
        return [...this.supportedLanguages];
    }

    /**
     * Método de depuración para verificar traducciones
     */
    debugTranslations() {
        console.group('🔍 Debug de Traducciones i18n');
        console.log('Idioma actual:', this.currentLanguage);
        console.log('Traducciones cargadas:', this.translations);
        
        // Verificar elementos que no se traducen
        const elementsToTranslate = document.querySelectorAll('[data-i18n]');
        const missingTranslations = [];
        
        elementsToTranslate.forEach(element => {
            const key = element.getAttribute('data-i18n');
            const translation = this.getTranslation(key);
            
            if (!translation) {
                missingTranslations.push({
                    element: element,
                    key: key,
                    currentContent: element.textContent || element.innerHTML
                });
            }
        });
        
        if (missingTranslations.length > 0) {
            console.warn('Elementos sin traducción encontrados:', missingTranslations);
        } else {
            console.log('✅ Todas las traducciones encontradas correctamente');
        }
        
        // Verificar placeholders
        const placeholderElements = document.querySelectorAll('[data-i18n-placeholder]');
        const missingPlaceholders = [];
        
        placeholderElements.forEach(element => {
            const key = element.getAttribute('data-i18n-placeholder');
            const translation = this.getTranslation(key);
            
            if (!translation) {
                missingPlaceholders.push({
                    element: element,
                    key: key,
                    currentPlaceholder: element.getAttribute('placeholder')
                });
            }
        });
        
        if (missingPlaceholders.length > 0) {
            console.warn('Placeholders sin traducción encontrados:', missingPlaceholders);
        } else {
            console.log('✅ Todos los placeholders encontrados correctamente');
        }
        
        console.groupEnd();
    }
}

// Instancia global del sistema i18n
let i18nInstance = null;

/**
 * Inicialización automática cuando el DOM está listo
 */
document.addEventListener('DOMContentLoaded', () => {
    i18nInstance = new I18n();
});

/**
 * API global para interactuar con el sistema i18n
 */
window.i18n = {
    getInstance: () => i18nInstance,
    changeLanguage: (lang) => i18nInstance?.changeLanguage(lang),
    getCurrentLanguage: () => i18nInstance?.getCurrentLanguage(),
    getTranslation: (key) => i18nInstance?.getTranslation(key),
    isLanguageSupported: (lang) => i18nInstance?.isLanguageSupported(lang),
    debug: () => i18nInstance?.debugTranslations()
};

// Export para uso en módulos (opcional)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = I18n;
}