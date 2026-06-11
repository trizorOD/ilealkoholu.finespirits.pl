const Main  = {
    sliderCollectForm: null,
    sliderReview: null,
    sliderOffer: null,
    selectStyleHoliday: null,

    initLoad: function() {
        this.initPickmeup()
        this.initLoadFixedNav()
    },

    initReady: function() {
        this.initSelectStyle()
        this.initStepsSliderCollect()
        this.initReviewSlider()
        this.initMask()
        this.initDropdown()
        this.initNavFixed()
        this.initMobileMenu()
        this.initOffersMobileSlider();
        this.scrollTo();

    },

    initOffersMobileSlider: function() {
        if(window.innerWidth <= 992) {
            this.sliderMove = new Swiper(".offers__content-slider", {
                slidesPerView: "auto",
                spaceBetween: 8
            })
        }
    },

    initMobileMenu: function() {
        jQuery(document).on("click", ".mobile-menu-open", function(e) {
            this.slideMenuProcess(e.target);
        }.bind(this));
        jQuery(document).on("click", ".mobile-menu-close", function(e) {
            this.slideMenuProcess(e.target);
        }.bind(this));
    },

    slideMenuProcess: function(block) {
        const section = jQuery(block).closest('.header__section-block');
        if(jQuery(section).hasClass('active')) {
            jQuery(section).removeClass('active')
            jQuery(section).find(".header__section-nav").slideUp(500);
        } else {
            jQuery(section).addClass('active')
            jQuery(section).find(".header__section-nav").slideDown(500);
        }
    },

    initNavFixed: function() {
        const section = document.querySelector('.header__section');
        const block = section.querySelector('.header__section-block');

        window.addEventListener('scroll', function() {
            const top = section.getBoundingClientRect().top;
            block.classList.remove('no-transition');

            this.detectFixedMenu(section, top)
        }.bind(this));


    },

    initLoadFixedNav: function() {
        const section = document.querySelector('.header__section');
        const top = section.getBoundingClientRect().top;
        this.detectFixedMenu(section, top);
    },

    detectFixedMenu: function(section, top) {
        if(window.innerWidth > 992) {
            if (window.scrollY >= top) {
                section.classList.add('fixed');
            } else {
                section.classList.remove('fixed');
            }
        }
    },

    initDropdown: function() {
        const delay = 300;
        jQuery(document).on("click", ".item-dropdown-title", function() {
            const item_section = jQuery(this).closest(".item-dropdown")
            const item_descr = jQuery(item_section).find(".item-dropdown-content")

            if(jQuery(item_section).hasClass('active')) {
                jQuery(item_section).removeClass('active')
                jQuery(item_descr).slideUp(delay);
            } else {
                jQuery(item_section).addClass('active')
                jQuery(item_descr).slideDown(delay);
            }
        })
    },

    initMask: function() {
        jQuery(".input-phone").each(function() {
            jQuery(this).inputmask({
                mask: "+48 999-999-999",
                greedy: false,
                clearMaskOnLostFocus: false
            });
            jQuery(this).blur(function() {
                if(jQuery(this).val().includes('_')) {
                    jQuery(this).val('');
                }
            })
        })
    },

    initReviewSlider: function(e) {
        const options = {
            slidesPerView: "auto",
            spaceBetween: 20,
            navigation: {
                nextEl: ".swiper-review-next",
                prevEl: ".swiper-review-prev",
            },
        };

        this.sliderMove = new Swiper(".reviews__items", options);
    },

    initSelectStyle: function() {
        this.selectStyleHoliday = jQuery("#calc_collect_form").find('.select-style-wrap').customSelectStyle({ default: true })
    },

    initStepsSliderCollect: function() {
        this.sliderCollectForm = new Swiper(".calc__block-slider", {
            autoHeight: true,
            allowTouchMove: false,
            effect: "fade",
            fadeEffect: {
                crossFade: true
            },
            navigation: {
                nextEl: ".move-next",
                //prevEl: ".cancel-move-prev",
            },
        });

        jQuery(document).on("click", "#first_collect_slide", function() {
            this.sliderCollectForm.slideTo(0)
            Form.calcFormReset();
        }.bind(this))
    },

    delay: function (ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    },


    scrollTo: function() {
        jQuery(document).on('click', '.scrollTo', function(e) {
            e.preventDefault();
            const id_block = jQuery(e.target).data('id')
            if(id_block !== undefined) {
                this.scrollToElem(id_block)
            }
        }.bind(this))
    },

    scrollToElem: function(id, topMove) {
        if (topMove === undefined) {
            topMove = jQuery(window).width() <= 992 ? -120 : -100;
        }
        var elem = document.getElementById(id)
        if (elem !== undefined && elem !== null) {
            var top = jQuery(elem).offset().top
            top = top + topMove;
            jQuery('html, body').animate({ scrollTop: top }, 'slow');
            window.history.replaceState(null, null, window.location.pathname + window.location.search);
        }
    },

    initPickmeup: function initPickmeup() {
        var dateInputs = jQuery('.input-date');

        if (dateInputs.length) {
            jQuery.each(dateInputs, function(index, input) {
                input.type = 'text';

                var $input = jQuery(input);
                $input.attr('readonly', true);

                var format = $input.attr('date-format') ? $input.attr('date-format') : 'd.m.Y';
                var max = $input.attr('date-max') ? $input.attr('date-max') : false;
                var min = $input.attr('date-min') ? $input.attr('date-min') : false;
                var calendarDate = $input.attr('date-calendar') ? $input.attr('date-calendar') : false;

                var options = {
                    format: format,
                    prev: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><path d="M11 13.9999L5 7.99988L11 1.99988" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
                    next: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><path d="M5 13.9999L11 7.99988L5 1.99988" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
                    default_date: false,
                    hide_on_select: true,
                    absolute: true
                };

                if (calendarDate) {
                    options.date = new Date(calendarDate);
                }

                if (max) {
                    if (max === 'yesterday') {
                        var yesterday = new Date();
                        yesterday.setDate(yesterday.getDate() - 1);
                        options.max = yesterday;
                    } else {
                        options.max = new Date(max);
                    }
                } else {
                    var hundredYearsLater = new Date();
                    hundredYearsLater.setFullYear(hundredYearsLater.getFullYear() + 100);
                    options.max = hundredYearsLater;
                }

                if (min) {
                    if (min === 'today') {
                        options.min = new Date();
                    } else {
                        options.min = new Date(min);
                    }
                } else {
                    var hundredYearsAgo = new Date();
                    hundredYearsAgo.setFullYear(hundredYearsAgo.getFullYear() - 100);
                    options.min = hundredYearsAgo;
                }

                pickmeup(input, options);
            });
        }
    },

    setCookie: function setCookie(name, value, days) {
        const date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));

        document.cookie =
            name + "=" + encodeURIComponent(value) +
            "; expires=" + date.toUTCString() +
            "; path=/";
    },

    getCookie: function (name) {
        const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
        return match ? decodeURIComponent(match[2]) : null;
    }

   
}

document.addEventListener("DOMContentLoaded", function() {
    try {
        Main.initReady()
    } catch(e) {
        console.log("Error Init Ready Main", e)
    }
});

window.addEventListener("load", (event) => {
    try {
        Main.initLoad()
    } catch(e) {
        console.log("Error Init Loaded Main", e)
    }
})





