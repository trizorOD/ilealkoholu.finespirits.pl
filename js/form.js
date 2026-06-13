const Form  = {
    isCalcSuccess: false,
    calcModalStep: 1,
    calcFormCollect: null,

    fields_conatct_form: {
        contact_name: {
            rules: 'required',
            messages: {
                required: "Wpisz swoje imię"
            }
        },
        contact_email: {
            rules: 'required|email',
            messages: {
                required: "Adres e-mail jest wymagany",
                email: "Nieprawidłowy format wiadomości e-mail"
            }
        },
        contact_phone: {
            rules: 'required|phone',
            messages: {
                required: "Adres e-mail jest wymagany",
                phone: "Numer telefonu może zawierać tylko cyfry"
            }
        },
        contact_date: {
            rules: 'required',
            messages: {
                required: "Podaj datę wydarzenia",
            }
        },
        contact_check_zgoda: {
            rules: 'checked',
            messages: {}
        },
        contact_check_year: {
            rules: 'checked',
            messages: {}
        },
    },

    fields_calc_modal_form: {
        calc_modal_form_email: {
            rules: 'required|email',
            messages: {
                required: "Adres e-mail jest wymagany",
                email: "Nieprawidłowy format wiadomości e-mail"
            }
        },
        calc_modal_form_confirm_s1: {
            rules: 'checked',
            messages: {}
        },
    },

    fields_calc_modal_form_step2: {
        calc_modal_form_name: {
            rules: 'required',
            messages: {
                required: "Wpisz swoje imię"
            }
        },
        calc_modal_form_phone: {
            rules: 'required|phone',
            messages: {
                required: "Wpisz numer telefonu",
                phone: "Numer telefonu może zawierać tylko cyfry"
            }
        },
        calc_modal_form_confirm: {
            rules: 'checked',
            messages: {}
        },
    },

    fields_spec_modal_form: {
        spec_modal_form_email: {
            rules: 'required|email',
            messages: {
                required: "Adres e-mail jest wymagany",
                email: "Nieprawidłowy format wiadomości e-mail"
            }
        },
        spec_modal_form_phone: {
            rules: 'required|phone',
            messages: {
                required: "Adres e-mail jest wymagany",
                phone: "Numer telefonu może zawierać tylko cyfry"
            }
        },
        spec_modal_form_confirm: {
            rules: 'checked',
            messages: {}
        },
    },

    fields_calc_collect_form: {
        calc_guests: {
            rules: 'required',
            messages: {
                required: "Wpisz swoje imię"
            }
        },
        calc_hours: {
            rules: 'required|min_value:1',
            messages: {
                required: "Wpisz czas trwania wydarzenia",
                min_value: "Czas wydarzenia ma trwać co najmniej {count} godzinę"
            }
        },
        calc_drink: {
            rules: 'group_check',
            messages: {
                group_check: "Wybierz swój preferowany napój"
            }
        }
    },

    calcFormCollect: null,
    loadingBar: null,
    loadingTextBar: null,
    loadingDuration: 0,
    loadingStartTime:null,
    MainClass: Main,

    initLoad: function () {

    },

    initReady: function () {
        this.initContactCalcForm()
        this.initCollectCalcForm()

    },

    initCollectCalcForm: function() {
        jQuery('.collect_form').on('click', function(e) {
            e.preventDefault()
            const button = e.target
            const form = button.closest('form')
            let status_validate = false

            jQuery(form).addClass('form-validated');

            if(this.validateForm(form, this.fields_calc_collect_form)) {
                this.collectCalcForm(form)
            }
        }.bind(this))

        jQuery("#calc_collect_form").on('input change', 'input', function (e) {
            this.validateForm(e.target.closest('form'), this.fields_calc_collect_form)
        }.bind(this));

        jQuery(".show-spec-modal").on('click', function (e) {
            e.preventDefault()
            FinespiritsModals.openModal(jQuery(".modal-spec"))
        }.bind(this));

        jQuery(".btn-calc-form").on('click', function (e) {
            e.preventDefault()
            FinespiritsModals.openModal(jQuery(".modal-calc"))
        }.bind(this));

        const email_calc = Main.getCookie('calc_email');
        jQuery('#calc_modal_form_email').val(email_calc);
    },

    collectCalcForm: function(form) {
        let calc_drink_arr = jQuery(`input[name="${rule}"]:checked`)
            .map(function () {
                return jQuery(this).val();
            })
            .get();
        this.calcFormCollect = {
            results: [],
            data: {
                calc_guests:     jQuery(form).find("input[name='calc_guests']").val(),
                calc_hours:     jQuery(form).find("input[name='calc_hours']").val(),
                calc_event:     jQuery(form).find("select[name='calc_event'] option:selected").val(),
                calc_drink:     calc_drink_arr
            }
        }

        let guests = this.calcFormCollect.data.calc_guests
        let durationMultiplier = this.calcFormCollect.data.calc_hours / 4;
        if(durationMultiplier < 0.7) durationMultiplier = 0.7
        if(durationMultiplier > 1.8) durationMultiplier = 1.8

        const coefficient_events = {
            wesele: 1.35,
            urodziny: 1.15,
            chrzciny: 0.75,
            impreza_prywatna: 1.0,
            event_firmowy: 0.85,
            inne: 1.0,
        }

        let eventTypeMultiplier = coefficient_events[ this.calcFormCollect.data.calc_event] !== undefined ? coefficient_events[ this.calcFormCollect.data.calc_event] : 0;
        let categoryShareMultiplier = 0;

        if(this.calcFormCollect.data.calc_drink.length === 1) categoryShareMultiplier = 1
        if(this.calcFormCollect.data.calc_drink.length === 2) categoryShareMultiplier = 0.75
        if(this.calcFormCollect.data.calc_drink.length === 3) categoryShareMultiplier = 0.6
        if(this.calcFormCollect.data.calc_drink.length >= 4) categoryShareMultiplier = 0.5

        if(this.calcFormCollect.data.calc_drink.length > 0) {
            this.calcFormCollect.data.calc_drink.forEach(function(item){
                let res = null
                switch(item) {
                    case "wino":
                        res = {
                            value : Math.ceil((guests / 3) * durationMultiplier * eventTypeMultiplier * categoryShareMultiplier),
                            title: "Wino",
                            type: "butelki",
                            icon: "/images/icons/wino-icon.svg"
                        }
                        break;
                    case "mocniejsze_alkohole":
                        res = {
                            value: Math.ceil((guests / 12) * durationMultiplier * eventTypeMultiplier * categoryShareMultiplier),
                            title: "Mocne alkohole",
                            type: "butelki",
                            icon: "/images/icons/mocne-icon.svg"
                        }
                        break;
                    case "piwo":
                        res = {
                            value: Math.ceil((guests / 2) * durationMultiplier * eventTypeMultiplier * categoryShareMultiplier),
                            title: "Piwo",
                            type: "butelki",
                            icon: "/images/icons/wino-icon.svg"
                        }
                        break;
                    case "wino_bezalkoholowe":
                        res = {
                            value: Math.ceil((guests / 6) * durationMultiplier * 0.8), 
                            title: "Wino bezalkoholowe",
                            type: "butelki",
                            icon: "/images/icons/wino-icon.svg"
                        }
                        break;
                    case "musujące":
                        res = {
                            value: Math.ceil((guests / 5) * durationMultiplier * eventTypeMultiplier * categoryShareMultiplier),
                            title: "Musujące",
                            type: "butelki",
                            icon: "/images/icons/musujace-icon.svg"
                        }
                        break;
                    case "woda":
                        res = {
                            value: Math.ceil(guests * 0.6 * durationMultiplier), 
                            title: "Napoje",
                            type: "litrów",
                            icon: "/images/icons/napoje-icon.svg"
                        }
                        break;
                }
                this.calcFormCollect.results.push(res)
            }.bind(this))
        }

        Main.sliderCollectForm.slideTo(1);
        Main.scrollToElem('calc_block')
        this.slideStartLoadCollectForm();
    },

    initContactCalcForm: function() {
        jQuery('.send_form').on('click', function(e) {
            e.preventDefault()
            const button = e.target
            const form = button.closest('form')
            const formType = jQuery(form).attr('id')
            let status_validate = false

            jQuery(form).addClass('form-validated');

            if(formType === "contact_form") status_validate = this.validateForm(form, this.fields_conatct_form)
            if(formType === "calc_modal_form") {
                if(this.calcModalStep === 1) {
                    status_validate = this.validateForm(form, this.fields_calc_modal_form)
                } else {
                    status_validate = this.validateForm(form, this.fields_calc_modal_form_step2)
                }
            }
            if(formType === "spec_modal_form") status_validate = this.validateForm(form, this.fields_spec_modal_form)

            jQuery(button).prop('disabled', true)

            if(status_validate === true) {
                if(formType === 'calc_modal_form' && this.calcModalStep === 1) {
                    const s1Checked = jQuery('#calc_modal_form_confirm_s1').is(':checked');
                    jQuery('#calc_modal_form_confirm').prop('checked', s1Checked);
                    jQuery(form).find('.modal__step-1').hide();
                    jQuery(form).find('.modal__step-2').show();
                    jQuery('.modal-calc .modal__head-back').show();
                    this.calcModalStep = 2;
                    jQuery(button).prop('disabled', false);
                    return;
                }

                let dataForm = {}

                if(formType === 'contact_form') {
                    dataForm = this.prepareDataContactForm(form)
                } else if(formType === 'calc_modal_form') {
                    dataForm = this.prepareDataCalcForm(form)
                } else if(formType === 'spec_modal_form') {
                    dataForm = this.prepareDataSpecForm(form)
                }

                $.ajax({
                    url: "/feedback.php",
                    type: "POST",
                    data: dataForm,
                    dataType: "html"
                }).done(function(json) {
                    //this.formLoading(form, false)
                    jQuery(button).prop('disabled', false)
                    let response = JSON.parse(json);

                    if(response.error !== undefined && response.error === false) {
                        /*if(formType === 'cancel_form') {
                            this.sliderCancel.slideNext()
                        } else if(formType === 'move_form') {
                            this.sliderMove.slideNext()
                        }*/

                        window.dataLayer = window.dataLayer || [];

                        if(formType === 'contact_form') {
                            window.dataLayer.push({
                                event: 'lead_submitted',
                                form_source: 'main_contact_form',
                                form_location: 'contact_section'
                            });
                            FinespiritsModals.openModal('.modal-success');

                        }
                        if(formType === 'calc_modal_form') {
                            window.dataLayer.push({
                                event: 'lead_submitted',
                                form_source: 'calculator_email_form',
                                form_location: 'calculator_result'
                            });
                            FinespiritsModals.closeModal(jQuery('.modal-calc'))
                            this.setResultsCalcForm();
                            Main.sliderCollectForm.slideTo(2);
                            Main.setCookie('calc_email', jQuery('#calc_modal_form_email').val(), 7);
                            jQuery(".calc__step-wrap").addClass("active")
                            this.resetCalcModal(form);
                        }
                        if(formType === 'spec_modal_form') {
                            window.dataLayer.push({
                                event: 'lead_submitted',
                                form_source: 'consultation_form',
                                form_location: 'calculator_result'
                            });
                            FinespiritsModals.closeModal(jQuery('.modal-spec'))
                            FinespiritsModals.openModal(jQuery('.modal-success'))
                        }

                        jQuery(form)[0].reset();
                        jQuery(form).addClass('form-sent')
                        jQuery(form).removeClass('form-validated')
                        
                    } else {
                        jQuery(form).addClass('form-error')
                    }

                    setTimeout(function() {
                        jQuery(form).removeClass('form-sent')
                        jQuery(form).removeClass('form-error')
                    }.bind(this), 5000)

                }.bind(this)).fail(function(jqXHR, textStatus) {
                    jQuery(button).prop('disabled', false)
                    jQuery(form).addClass('form-error')
                    setTimeout(function() {
                        jQuery(form).removeClass('form-sent')
                        jQuery(form).removeClass('form-error')
                    }, 5000)
                    console.warn("Помилка AJAX: " + textStatus, 'error');
                });
            }
        }.bind(this))

        jQuery("#contact_form").on('input change pickmeup-change', 'input', function (e) {
            this.validateForm(e.target.closest('form'), this.fields_conatct_form)
        }.bind(this));
        jQuery("#calc_modal_form").on('input change', 'input', function (e) {
            this.validateForm(e.target.closest('form'), this.fields_calc_modal_form)
        }.bind(this));
        jQuery("#spec_modal_form").on('input change', 'input', function (e) {
            this.validateForm(e.target.closest('form'), this.fields_spec_modal_form)
        }.bind(this));

        jQuery('.modal-calc .modal__head-back').on('click', function(e) {
            e.preventDefault();
            const form = document.getElementById('calc_modal_form');
            const s2Checked = jQuery('#calc_modal_form_confirm').is(':checked');
            jQuery('#calc_modal_form_confirm_s1').prop('checked', s2Checked);
            jQuery(form).find('.modal__step-2').hide();
            jQuery(form).find('.modal__step-1').show();
            jQuery('.modal-calc .modal__head-back').hide();
            this.calcModalStep = 1;
        }.bind(this));

        jQuery('.calc-skip-btn').on('click', function(e) {
            e.preventDefault();
            const form = document.getElementById('calc_modal_form');
            const button = e.target;
            jQuery(button).prop('disabled', true);
            const dataForm = this.prepareDataCalcForm(form);
            $.ajax({
                url: "/feedback.php",
                type: "POST",
                data: dataForm,
                dataType: "html"
            }).done(function(json) {
                jQuery(button).prop('disabled', false);
                let response = JSON.parse(json);
                if(response.error !== undefined && response.error === false) {
                    window.dataLayer = window.dataLayer || [];
                    window.dataLayer.push({
                        event: 'lead_submitted',
                        form_source: 'calculator_email_form',
                        form_location: 'calculator_result'
                    });
                    FinespiritsModals.closeModal(jQuery('.modal-calc'));
                    this.setResultsCalcForm();
                    Main.sliderCollectForm.slideTo(2);
                    Main.setCookie('calc_email', jQuery('#calc_modal_form_email').val(), 7);
                    jQuery(".calc__step-wrap").addClass("active");
                    this.resetCalcModal(form);
                } else {
                    jQuery(form).addClass('form-error');
                    setTimeout(function() { jQuery(form).removeClass('form-error'); }, 5000);
                }
            }.bind(this)).fail(function() {
                jQuery(button).prop('disabled', false);
            }.bind(this));
        }.bind(this));
    },

    prepareDataCalcForm: function(form) {
        const formType = jQuery(form).attr('id')
        const dataForm = {
            type:           formType,
            calc_email:     jQuery(form).find("input[name='calc_modal_form_email']").val(),
            calc_name:      jQuery(form).find("input[name='calc_modal_form_name']").val(),
            calc_phone:     jQuery(form).find("input[name='calc_modal_form_phone']").val(),
            calc_data:      this.calcFormCollect
        }

        return dataForm
    },

    prepareDataContactForm: function(form) {
        const formType = jQuery(form).attr('id')
        const dataForm = {
            type:       formType,
            contact_name:       jQuery(form).find("input[name='contact_name']").val(),
            contact_email:      jQuery(form).find("input[name='contact_email']").val(),
            contact_date:       jQuery(form).find("input[name='contact_date']").val(),
            contact_phone:      jQuery(form).find("input[name='contact_phone']").val(),
            contact_newsletter: jQuery(form).find("input[name='contact_check_newsletter']").is(':checked') ? 1 : 0,
        }

        return dataForm;
    },

    prepareDataSpecForm: function(form) {
        const formType = jQuery(form).attr('id')
        const dataForm = {
            type:       formType,
            spec_email:      jQuery(form).find("input[name='spec_modal_form_email']").val(),
            spec_phone:      jQuery(form).find("input[name='spec_modal_form_phone']").val(),
            calc_data:       this.calcFormCollect
        }

        return dataForm;
    },

    validateForm: function (form, rules) {
        const button = jQuery(form).find('.send_form, .collect_form')

        if(jQuery(form).hasClass('form-validated')) {
            jQuery(button).prop('disabled', true)

            jQuery(form).find('.field-form-block').each(function () {
                jQuery(this).removeClass('field-form-error')
            })

            const errors = {}
            let status_form_validate = true;

            for (rule in rules) {
                let input = form.querySelector(`#${rule}`)
                const rules_value = rules[rule].rules
                const rules_required = rules_value.split('|')

                for (rule_element in rules_required) {
                    if (errors[rule] === undefined) {
                        errors[rule] = []
                    }
                    let status_validate_field = false

                    switch (rules_required[rule_element]) {
                        case 'required':
                            if (input.value === '') {
                                status_validate_field = true;
                            }
                            break;
                        case 'phone':
                            if (input.value.includes('_')) {
                                status_validate_field = true;
                            }
                            break;
                        case 'checked':
                            if (!input.checked) {
                                status_validate_field = true;
                            }
                            break;
                        case 'email':
                            var EMAIL_REG = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/
                            if (!EMAIL_REG.test(input.value)) {
                                status_validate_field = true;
                            }
                            break;
                        case 'group_check':
                            let group_check = jQuery(`input[name="${rule}"]:checked`)
                                .map(function () {
                                    return jQuery(this).val();
                                })
                                .get()
                                .join(',');
                            if(group_check === '') {
                                status_validate_field = true;
                            }
                            break;

                        default:
                            if (rules_required[rule_element].startsWith('min_value:')) {
                                let min = parseInt(
                                    rules_required[rule_element].split(':')[1]
                                );
                                if (input.value < min) {
                                    status_validate_field = true;
                                }
                            }
                            break;
                    }

                    if(status_validate_field === true) {
                        status_form_validate = false
                        if(rules[rule].messages[rules_required[rule_element]] !== undefined) {
                            errors[rule].push([rules[rule].messages[rules_required[rule_element]]])
                        } else {
                            if (rules_required[rule_element].startsWith('min') || rules_required[rule_element].startsWith('max')) {
                                let count_value = parseInt(
                                    rules_required[rule_element].split(':')[1]
                                );
                                let current_rule = rules_required[rule_element].split(':')[0]
                                if(rules[rule].messages[current_rule] !== undefined) {
                                    const message = rules[rule].messages[current_rule].replace(/\{count\}/g, count_value)
                                    errors[rule].push(message)
                                } else {
                                    errors[rule].push(false)
                                }
                            } else {
                                errors[rule].push(false)
                            }
                        }
                    }
                }
            }

            if (!status_form_validate) {
                for (input_id in errors) {
                    const input_rules = errors[input_id]
                    if(input_rules[0] !== undefined) {
                        let container_element = jQuery(`#${input_id}`).closest('.field-form-block')
                        jQuery(container_element).addClass('field-form-error')

                        container_element.find('.field-form-mess').text(input_rules[0])
                    }
                }
                return false
            }
            jQuery(button).prop('disabled', false)
            return true
        }
    },

    slideStartLoadCollectForm: async function () {
        await Main.delay(700);

        this.loadingBar = document.querySelector('[data-quiz-loading-bar]');
        this.loadingTextBar = document.querySelector('[data-quiz-loading-percent]');
        
        this.loadingDuration = 5000;
        this.loadingStartTime = performance.now();

        requestAnimationFrame(this.animateLoading.bind(this));
    },

    animateLoading: function (currentTime) {
        const elapsed = currentTime - this.loadingStartTime;

        const progress = Math.min(
            (elapsed / this.loadingDuration) * 100,
            100
        );

        this.loadingBar.querySelector('span').style.setProperty(
            '--percent',
            `${progress}%`
        );
        this.loadingTextBar.innerText = `Ukończono ${parseInt(progress)}%`;

        if (progress < 100) {
            requestAnimationFrame(this.animateLoading.bind(this));
        } else {
            setTimeout(function() {
                this.loadingBar.querySelector('span').style.setProperty(
                    '--percent',
                    `${0}%`
                );
                this.loadingTextBar.innerText = `0% Completed`;
            }.bind(this), 1000)
            
            this.setResultsCalcForm();
            const email_calc = Main.getCookie('calc_email');
            jQuery('#calc_modal_form_email').val(email_calc);
            const calcForm = document.getElementById('calc_modal_form');
            this.resetCalcModal(calcForm);
            FinespiritsModals.openModal(jQuery(".modal-calc"));
            Main.sliderCollectForm.slideTo(2);
        }
    },

    resetCalcModal: function(form) {
        this.calcModalStep = 1;
        jQuery(form).find('.modal__step-1').show();
        jQuery(form).find('.modal__step-2').hide();
        jQuery('.modal-calc .modal__head-back').hide();
        jQuery('#calc_modal_form_confirm').prop('checked', false);
    },

    calcFormReset: function() {
        const form = document.getElementById("calc_collect_form")
        jQuery(form).removeClass('form-validated');
        if(Main.selectStyleHoliday !== null) {
            jQuery("#type_holiday").val('wesele').trigger('change');
            Main.selectStyleHoliday.resetSelectStyle();
        }
        
        setTimeout(() => {
            jQuery("#guests_count").text('');
            jQuery("#hour_count").text('');
            jQuery("#calc_menu_items").html('')
            jQuery(".calc__step-wrap").removeClass("active")
        }, 500)

        this.calcFormCollect = null
          
        form.reset();
    },

    setResultsCalcForm: function() {
        jQuery("#calc_menu_items").html('');

        if(this.calcFormCollect.results.length > 0) {
            jQuery("#guests_count").text(this.calcFormCollect.data.calc_guests);
            jQuery("#hour_count").text(this.calcFormCollect.data.calc_hours);

            this.calcFormCollect.results.forEach(function(item) {
                const html = `
                    <div class="calc__menu-item">
                        <div class="calc__menu-title">
                            <div class="calc__menu-title-icon"><img src="${item.icon}" alt="${item.title}"></div>
                            <div class="calc__menu-title-text">${item.title}:</div>
                        </div>
                        <div class="calc__menu-bottles">${item.value} ${item.type}</div>
                    </div>
                `;
                jQuery("#calc_menu_items").append(html)
            }.bind(this))

        }
    }
}

document.addEventListener("DOMContentLoaded", function() {
    try {
        Form.initReady()
    } catch(e) {
        console.log("Error Init Ready Form", e)
    }
});

window.addEventListener("load", (event) => {
    try {
        Form.initLoad()
    } catch(e) {
        console.log("Error Init Loaded Form", e)
    }
})





