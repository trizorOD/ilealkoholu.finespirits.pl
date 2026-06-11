function selectStyle() {
    this.select_container = null
    this.select_element = null
    this.select_title = null
    this.select_default = null

    this.init = function(params) {
        if(params.select_container) this.select_container = params.select_container
        else this.throwError("Not found select element")

        this.select_element = this.select_container.querySelector('select')

        if(params.title) this.select_title = params.title
        else this.select_title = ''

        if(params.default) this.select_default = params.default
        else this.select_default = false

        this.loadSelect(true)

        this.run()

        return this
    },

        this.resetSelectStyle = function() {
            //this.run()
            jQuery(this.select_container).find('.select-block').remove()
            this.run()
        }

    this.run = function() {

        jQuery(this.select_element).addClass("none")
        jQuery(this.select_container).addClass('select-style').prepend(this.generateElementSelect());

        jQuery(this.select_container).find(".select-option").click(function(event) {
            var optionText = event.target.innerText
            var optionValue = event.target.dataset['value']
            jQuery(this.select_element).val(optionValue).change()
            jQuery(this.select_container).find('.select-block-value').text(optionText)

            jQuery(this.select_container).find('.select-option').each(function() {
                jQuery(this).removeClass('select-option-active')
            })

            jQuery(this.select_container).find('.select-option[data-value = "'+this.select_element.value+'"]').addClass('select-option-active')

            this.triggerSelect()
        }.bind(this));

        jQuery(this.select_container).find(".select-block-content").click(function(event) {
            this.triggerSelect()
        }.bind(this));


        document.addEventListener( 'click', (e) => {
            const withinBoundaries = e.composedPath().includes(this.select_container);
            if ( ! withinBoundaries ) {
                jQuery(this.select_container).removeClass("active-select-style")
            }
        })

        this.loadSelect(false)
    },

        this.generateElementSelect = function() {
            var selectOptions = this.select_element.querySelectorAll('option')

            var html = ''
            var statusSelected = false
            if(selectOptions.length > 0) {
                let default_title = selectOptions[0].innerText
                for(let select_key in selectOptions) {
                    if(selectOptions[select_key].selected && this.select_default) {
                        default_title = selectOptions[select_key].innerText
                        statusSelected = true
                    }
                }

                html += "<div class='select-block'>";
                html += `<div class='select-block-content ${this.select_title ? 'select-block-is-title' : '' }'>`;
                if(this.select_title) {
                    html += `<div class='select-block-title'>${this.select_title}</div>`;
                }
                if(!this.select_default && !statusSelected) {
                    default_title = ''
                }
                html += `<div class='select-block-value'>${default_title}</div>`;
                html += "</div>";
                html += "<div class='select-block-options'>";
                for(let option_key in selectOptions) {
                    if(selectOptions[option_key].value !== undefined) {
                        if(!statusSelected) {
                            html += `<div class="select-option ${!option_key == 0 ? 'select-option-active' : ''} " data-value="${selectOptions[option_key].value}">${selectOptions[option_key].text}</div>`
                        } else {
                            html += `<div class="select-option ${selectOptions[option_key].selected ? 'select-option-active' : ''} " data-value="${selectOptions[option_key].value}">${selectOptions[option_key].text}</div>`
                        }
                    }
                }
                html += "</div>";
                html += '</div>';
            }

            return html;
        },

        this.triggerSelect = function(status) {
            jQuery(this.select_container).toggleClass("active-select-style")
        },

        this.loadSelect = function(status) {
            if(status) {
                jQuery(this.select_container).find('.loading').remove()
                jQuery(this.select_container).prepend("<img width='40px' class='loaderSelectImg' src='/libs/selectStyle/preloader.gif' />")
            } else {
                jQuery(this.select_container).find('.loaderSelectImg').remove()
            }
        },

        this.throwError = function(message) {
            throw new Error(`Style Select: ${message}`)
        }
}

jQuery.fn.customSelectStyle = function(params) {
    if (this.length === 0) {
        return this;
    }

    const select = (new selectStyle()).init({
        select_container: this[0],
        title: params !== undefined && params.title !== undefined  ? params.title : '',
        default: params !== undefined && params.default !== undefined  ? params.default : false,
    })

    return select
}









