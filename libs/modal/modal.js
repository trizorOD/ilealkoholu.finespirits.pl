const FinespiritsModals = {

    initReady: function() {
        this.initEvents()
    },
    initLoad: function() {

    },

    initEvents: function() {
        jQuery(document).on('click', '.modal__finespirits .modal__finespirits-close', function(e) {
            window.history.back();
            e.preventDefault()
            this.closeModal(e.target)
        }.bind(this))

        jQuery(document).on('click', '.modal__finespirits .modal__finespirits-close--cookie', function(e) {
            e.preventDefault()
            this.closeModalCookieWithLang(e.target)
        }.bind(this))

        jQuery(document).on('click', '.modal__finespirits .modal__lang-lang a', function(e) {
            e.preventDefault()
            this.langSwitcherModalCookie(e.target)
        }.bind(this))

        jQuery(document).on('click', '.modal__finespirits .modal__head-close', function(e) {
            e.preventDefault()
            this.closeModalCookie(e.target)
        }.bind(this))

        jQuery(document).on('click', '.modal_fade_close', function(e) {
            const elem = e.target
            if(jQuery(elem).closest('.modal__block').length === 0) {
                e.preventDefault()
                this.closeModalCookie(e.target)
            }
        }.bind(this))

        jQuery(document).on('click', '.modal__finespirits-close--cookie-lang', function(e) {
            e.preventDefault()
            this.closeModalCookieWithLang(e.target)
        }.bind(this))
    },

    openModal: function(elem) {
        const modal = jQuery(elem)
        if(modal !== undefined && modal !== null && modal.length > 0) {
            const cookie = modal.data('cookie')
            if(cookie === undefined) {
                modal.addClass('active');
                jQuery('body').addClass('overflow-scroll');
            } {
                if(this.getCookie('age_visited') === false) {
                    modal.addClass('active')
                }
                if(this.getCookie('newsletter_modal') === false) {
                    modal.addClass('active')
                }
            }

        }

    },

    langSwitcherModalCookie: function(element) {
        jQuery('.modal__finespirits .modal__lang-lang a').each(function() {
            jQuery(this).removeClass('active')
        })
        jQuery(element).addClass('active')
    },

    closeModalCookie: function(element) {
        const modal = jQuery(element).closest('.modal__finespirits')
        const cookie = modal.data('cookie')
        const check = jQuery(modal).find('input[name="remember"]').prop('checked')
        if(cookie !== undefined && check) {
            this.setCookie(cookie, 1, false)
        } else {
            this.setCookie(cookie, 1, true)
        }
        this.closeModal(element)
    },

    closeModalCookieWithLang: function(element) {
        const modal = jQuery(element).closest('.modal__finespirits')
        const cookie = modal.data('cookie')
        const check = jQuery('input[name="remember"]').prop('checked')
        if(cookie !== undefined && check) {
            this.setCookie(cookie, 1, false)
        } else {
            this.setCookie(cookie, 1, true)
        }
        const modal_lang = jQuery(modal).find('.modal__lang-lang')
        const activeLang = jQuery(modal_lang).find('a.active')
        if(activeLang.length > 0) {
            const current_lang = jQuery(activeLang).data('current')
            const choose_lang =  jQuery(activeLang).data('lang')
            if(current_lang == choose_lang) {
                this.closeModal(element)
            } else {
                window.location.href = activeLang[0].href;
                this.closeModal(element)
            }
        }
    },

    closeModal: function(element) {
        const modal = jQuery(element).closest('.modal__finespirits')

        if(modal !== undefined && modal !== null && modal.length > 0) {
            modal.removeClass('active')
            jQuery('body').removeClass('overflow-scroll');
        }
    },

    getCookie: function (name) {
        let match = document.cookie.match(new RegExp(
            "(?:^|; )" + name.replace(/([.$?*|{}()[\]\\/+^])/g, '\\$1') + "=([^;]*)"
        ));
        return match ? decodeURIComponent(match[1]) : false;
    },

    setCookie: function(name, value, tempory) {
        let cookie = `${name}=${value}; path=/`
        if(tempory === false) {
            cookie += `; max-age=${(60*60*24*30)}`
        }
        document.cookie = cookie
    }

}

document.addEventListener("DOMContentLoaded", function() {
    try {
        FinespiritsModals.initReady()
    } catch(e) {
        console.log("Error Init Ready FilespiritsModals", e)
    }
});

window.addEventListener("load", (event) => {
    try {
        FinespiritsModals.initLoad()
    } catch(e) {
        console.log("Error Init Loaded FilespiritsModals", e)
    }
})
