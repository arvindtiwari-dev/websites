(function ($) {
    "use strict";

    // Spinner
    var spinner = function () {
        setTimeout(function () {
            if ($('#spinner').length > 0) {
                $('#spinner').removeClass('show');
            }
        }, 1);
    };
    spinner();
    
    
    // Initiate the wowjs
    new WOW().init();


    // Sticky Navbar
    $(window).scroll(function () {
        if ($(this).scrollTop() > 300) {
            $('.sticky-top').css('top', '0px');
        } else {
            $('.sticky-top').css('top', '-100px');
        }
    });
    
    
    // Dropdown on mouse hover
    const $dropdown = $(".dropdown");
    const $dropdownToggle = $(".dropdown-toggle");
    const $dropdownMenu = $(".dropdown-menu");
    const showClass = "show";
    
    $(window).on("load resize", function() {
        if (this.matchMedia("(min-width: 992px)").matches) {
            $dropdown.hover(
            function() {
                const $this = $(this);
                $this.addClass(showClass);
                $this.find($dropdownToggle).attr("aria-expanded", "true");
                $this.find($dropdownMenu).addClass(showClass);
            },
            function() {
                const $this = $(this);
                $this.removeClass(showClass);
                $this.find($dropdownToggle).attr("aria-expanded", "false");
                $this.find($dropdownMenu).removeClass(showClass);
            }
            );
        } else {
            $dropdown.off("mouseenter mouseleave");
        }
    });
    
    
    // Back to top button
    $(window).scroll(function () {
        if ($(this).scrollTop() > 300) {
            $('.back-to-top').fadeIn('slow');
        } else {
            $('.back-to-top').fadeOut('slow');
        }
    });
    $('.back-to-top').click(function () {
        $('html, body').animate({scrollTop: 0}, 1500, 'easeInOutExpo');
        return false;
    });


    // Header carousel
    $(".header-carousel").owlCarousel({
        autoplay: true,
        smartSpeed: 1500,
        items: 1,
        dots: false,
        loop: true,
        nav : true,
        navText : [
            '<i class="bi bi-chevron-left"></i>',
            '<i class="bi bi-chevron-right"></i>'
        ]
    });


    // Testimonials carousel
    $(".testimonial-carousel").owlCarousel({
        autoplay: true,
        smartSpeed: 1000,
        center: true,
        margin: 24,
        dots: true,
        loop: true,
        nav : false,
        responsive: {
            0:{
                items:1
            },
            768:{
                items:2
            },
            992:{
                items:3
            }
        }
    });

    // Keep the current page link highlighted in the top navbar.
    var currentPage = window.location.pathname.split('/').pop() || 'index.html';
    $('#navbarCollapse .nav-link').each(function () {
        var href = $(this).attr('href');
        $(this).toggleClass('active', href === currentPage);
    });

    // Language switcher (English/Hindi) using Google Translate.
    function initLanguageSwitcher() {
        if (document.getElementById('uldhan-lang-switcher')) {
            return;
        }

        if (!document.getElementById('uldhan-lang-style')) {
            var style = document.createElement('style');
            style.id = 'uldhan-lang-style';
            style.textContent =
                '#uldhan-lang-switcher{position:fixed;right:16px;bottom:16px;z-index:99999;background:#fff;border:1px solid #d9d9d9;border-radius:8px;padding:6px;box-shadow:0 6px 18px rgba(0,0,0,.15);display:flex;gap:6px;align-items:center;}' +
                '.uldhan-lang-btn{border:1px solid #0d6efd;background:#fff;color:#0d6efd;padding:4px 8px;border-radius:6px;font-size:12px;font-weight:600;line-height:1;cursor:pointer;}' +
                '.uldhan-lang-btn.active{background:#0d6efd;color:#fff;}' +
                '#uldhan-google-translate{display:none;}' +
                '.goog-te-banner-frame.skiptranslate{display:none!important;}' +
                'body{top:0!important;}';
            document.head.appendChild(style);
        }

        var switcher = document.createElement('div');
        switcher.id = 'uldhan-lang-switcher';
        switcher.innerHTML = '<button type="button" class="uldhan-lang-btn" data-lang="en">EN</button><button type="button" class="uldhan-lang-btn" data-lang="hi">HI</button><div id="uldhan-google-translate"></div>';
        document.body.appendChild(switcher);

        function setGoogleCookie(lang) {
            var value = '/auto/' + lang;
            document.cookie = 'googtrans=' + value + ';path=/';
        }

        function updateButtons(lang) {
            $('#uldhan-lang-switcher .uldhan-lang-btn').each(function () {
                $(this).toggleClass('active', $(this).attr('data-lang') === lang);
            });
        }

        function applyLanguage(lang) {
            localStorage.setItem('uldhan-lang', lang);
            setGoogleCookie(lang);
            updateButtons(lang);

            var combo = document.querySelector('.goog-te-combo');
            if (combo) {
                combo.value = lang;
                combo.dispatchEvent(new Event('change'));
            }
        }

        var savedLang = localStorage.getItem('uldhan-lang') || 'en';
        setGoogleCookie(savedLang);
        updateButtons(savedLang);

        $('#uldhan-lang-switcher .uldhan-lang-btn').on('click', function () {
            applyLanguage($(this).attr('data-lang'));
        });

        window.uldhanGoogleTranslateInit = function () {
            if (!window.google || !google.translate || !google.translate.TranslateElement) {
                return;
            }

            new google.translate.TranslateElement({
                pageLanguage: 'en',
                includedLanguages: 'en,hi',
                autoDisplay: false,
                layout: google.translate.TranslateElement.InlineLayout.SIMPLE
            }, 'uldhan-google-translate');

            setTimeout(function () {
                applyLanguage(localStorage.getItem('uldhan-lang') || 'en');
            }, 250);
        };

        if (!document.querySelector('script[src*="translate_a/element.js"]')) {
            var script = document.createElement('script');
            script.src = 'https://translate.google.com/translate_a/element.js?cb=uldhanGoogleTranslateInit';
            script.async = true;
            document.body.appendChild(script);
        } else {
            setTimeout(function () {
                applyLanguage(savedLang);
            }, 500);
        }
    }

    initLanguageSwitcher();
    
})(jQuery);
