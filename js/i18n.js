const I18n = {
    lang: 'pl',
    data: {},

    init: async function () {
        const saved = localStorage.getItem('site_lang');
        this.lang = saved || 'pl';
        await this.load(this.lang);
        this.apply();
        this.bindSwitcher();
    },

    load: async function (lang) {
        try {
            const res = await fetch('/lang/' + lang + '.json');
            if (!res.ok) throw new Error('HTTP ' + res.status);
            this.data = await res.json();
            this.lang = lang;
            localStorage.setItem('site_lang', lang);
        } catch (e) {
            console.warn('i18n: failed to load lang "' + lang + '"', e);
        }
    },

    t: function (key, vars) {
        let str = this.data[key];
        if (str === undefined) return key;
        if (vars) {
            Object.keys(vars).forEach(function (k) {
                str = str.replace(new RegExp('\\{' + k + '\\}', 'g'), vars[k]);
            });
        }
        return str;
    },

    apply: function () {
        const self = this;
        document.documentElement.lang = this.lang;

        document.querySelectorAll('[data-i18n]').forEach(function (el) {
            el.textContent = self.t(el.getAttribute('data-i18n'));
        });

        document.querySelectorAll('[data-i18n-placeholder]').forEach(function (el) {
            el.placeholder = self.t(el.getAttribute('data-i18n-placeholder'));
        });

        var sel = document.getElementById('lang-select');
        if (sel) sel.value = self.lang;
    },

    setLang: async function (lang) {
        await this.load(lang);
        this.apply();
    },

    bindSwitcher: function () {
        const self = this;
        var sel = document.getElementById('lang-select');
        var wrap = document.getElementById('lang-select-wrap');
        if (sel) {
            sel.addEventListener('change', function () {
                self.setLang(sel.value);
            });
            sel.addEventListener('click', function () {
                if (wrap) wrap.classList.toggle('open');
            });
            sel.addEventListener('blur', function () {
                if (wrap) wrap.classList.remove('open');
            });
        }
    }
};
