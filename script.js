document.addEventListener('DOMContentLoaded', async function () {
  // Key map
  var ENTER = 13;
  var ESCAPE = 27;
  var SPACE = 32;
  var UP = 38;
  var DOWN = 40;
  var TAB = 9;

  function closest(element, selector) {
    if (Element.prototype.closest) {
      return element.closest(selector);
    }
    do {
      if (
        (Element.prototype.matches && element.matches(selector)) ||
        (Element.prototype.msMatchesSelector &&
          element.msMatchesSelector(selector)) ||
        (Element.prototype.webkitMatchesSelector &&
          element.webkitMatchesSelector(selector))
      ) {
        return element;
      }
      element = element.parentElement || element.parentNode;
    } while (element !== null && element.nodeType === 1);
    return null;
  }

  /******************** GEOLOCATION FIX START ********************
  
  (function () {
    try {
			// hide the web widget to start with
    	zE('webWidget', 'hide');
    
      // get geolocation by IP
      $.get(
        'https://api.ipgeolocation.io/ipgeo?apiKey=4ec46b0cbc974ddeb69e80cea3708aa6'
      ).then(function (geoIP) {
        // log result of geolocation by IP
        console.log(geoIP);

        // check if client is from restricted country
        if (geoIP.country_code2 !== 'NZ') {
          try {
          zE('webWidget', 'show');
          } catch (err) {
            console.log(err)
          }
        } else {
          // hide header link
          $('.submit-a-request').remove();
          // hide article link
          $('.article-more-questions').hide();
          // hide mobile menu if empty
          var navItems = $('.user-nav a');
          if (navItems.length === 0) {
            $('.menu-button').hide()
          }          
        }
      });
    } catch (err) {
      console.log(err)
    }
  })();

  /********************* GEOLOCATION FIX END *********************/

  // social share popups
  Array.prototype.forEach.call(
    document.querySelectorAll('.share a'),
    function (anchor) {
      anchor.addEventListener('click', function (e) {
        e.preventDefault();
        window.open(this.href, '', 'height = 500, width = 500');
      });
    }
  );

  // In some cases we should preserve focus after page reload
  function saveFocus() {
    var activeElementId = document.activeElement.getAttribute('id');
    sessionStorage.setItem('returnFocusTo', '#' + activeElementId);
  }
  var returnFocusTo = sessionStorage.getItem('returnFocusTo');
  if (returnFocusTo) {
    sessionStorage.removeItem('returnFocusTo');
    var returnFocusToEl = document.querySelector(returnFocusTo);
    returnFocusToEl && returnFocusToEl.focus && returnFocusToEl.focus();
  }

  // show form controls when the textarea receives focus or backbutton is used and value exists
  var commentContainerTextarea = document.querySelector(
      '.comment-container textarea'
    ),
    commentContainerFormControls = document.querySelector(
      '.comment-form-controls, .comment-ccs'
    );

  if (commentContainerTextarea) {
    commentContainerTextarea.addEventListener(
      'focus',
      function focusCommentContainerTextarea() {
        commentContainerFormControls.style.display = 'block';
        commentContainerTextarea.removeEventListener(
          'focus',
          focusCommentContainerTextarea
        );
      }
    );

    if (commentContainerTextarea.value !== '') {
      commentContainerFormControls.style.display = 'block';
    }
  }

  // Expand Request comment form when Add to conversation is clicked
  var showRequestCommentContainerTrigger = document.querySelector(
      '.request-container .comment-container .comment-show-container'
    ),
    requestCommentFields = document.querySelectorAll(
      '.request-container .comment-container .comment-fields'
    ),
    requestCommentSubmit = document.querySelector(
      '.request-container .comment-container .request-submit-comment'
    );

  if (showRequestCommentContainerTrigger) {
    showRequestCommentContainerTrigger.addEventListener('click', function () {
      showRequestCommentContainerTrigger.style.display = 'none';
      Array.prototype.forEach.call(requestCommentFields, function (e) {
        e.style.display = 'block';
      });
      requestCommentSubmit.style.display = 'inline-block';

      if (commentContainerTextarea) {
        commentContainerTextarea.focus();
      }
    });
  }

  // Mark as solved button
  var requestMarkAsSolvedButton = document.querySelector(
      '.request-container .mark-as-solved:not([data-disabled])'
    ),
    requestMarkAsSolvedCheckbox = document.querySelector(
      '.request-container .comment-container input[type=checkbox]'
    ),
    requestCommentSubmitButton = document.querySelector(
      '.request-container .comment-container input[type=submit]'
    );

  if (requestMarkAsSolvedButton) {
    requestMarkAsSolvedButton.addEventListener('click', function () {
      requestMarkAsSolvedCheckbox.setAttribute('checked', true);
      requestCommentSubmitButton.disabled = true;
      this.setAttribute('data-disabled', true);
      // Element.closest is not supported in IE11
      closest(this, 'form').submit();
    });
  }

  // Change Mark as solved text according to whether comment is filled
  var requestCommentTextarea = document.querySelector(
    '.request-container .comment-container textarea'
  );

  var usesWysiwyg =
    requestCommentTextarea &&
    requestCommentTextarea.dataset.helper === 'wysiwyg';

  function isEmptyPlaintext(s) {
    return s.trim() === '';
  }

  function isEmptyHtml(xml) {
    var doc = new DOMParser().parseFromString(`<_>${xml}</_>`, 'text/xml');
    var img = doc.querySelector('img');
    return img === null && isEmptyPlaintext(doc.children[0].textContent);
  }

  var isEmpty = usesWysiwyg ? isEmptyHtml : isEmptyPlaintext;

  if (requestCommentTextarea) {
    requestCommentTextarea.addEventListener('input', function () {
      if (isEmpty(requestCommentTextarea.value)) {
        if (requestMarkAsSolvedButton) {
          requestMarkAsSolvedButton.innerText =
            requestMarkAsSolvedButton.getAttribute('data-solve-translation');
        }
        requestCommentSubmitButton.disabled = true;
      } else {
        if (requestMarkAsSolvedButton) {
          requestMarkAsSolvedButton.innerText =
            requestMarkAsSolvedButton.getAttribute(
              'data-solve-and-submit-translation'
            );
        }
        requestCommentSubmitButton.disabled = false;
      }
    });
  }

  // Disable submit button if textarea is empty
  if (requestCommentTextarea && isEmpty(requestCommentTextarea.value)) {
    requestCommentSubmitButton.disabled = true;
  }

  // Submit requests filter form on status or organization change in the request list page
  Array.prototype.forEach.call(
    document.querySelectorAll(
      '#request-status-select, #request-organization-select'
    ),
    function (el) {
      el.addEventListener('change', function (e) {
        e.stopPropagation();
        saveFocus();
        closest(this, 'form').submit();
      });
    }
  );

  // Submit requests filter form on search in the request list page
  var quickSearch = document.querySelector('#quick-search');
  quickSearch &&
    quickSearch.addEventListener('keyup', function (e) {
      if (e.keyCode === ENTER) {
        e.stopPropagation();
        saveFocus();
        closest(this, 'form').submit();
      }
    });

  function toggleNavigation(toggle, menu) {
    var isExpanded = menu.getAttribute('aria-expanded') === 'true';
    menu.setAttribute('aria-expanded', !isExpanded);
    toggle.setAttribute('aria-expanded', !isExpanded);
  }

  function closeNavigation(toggle, menu) {
    menu.setAttribute('aria-expanded', false);
    toggle.setAttribute('aria-expanded', false);
    toggle.focus();
  }

  var burgerMenu = document.querySelector('.header .menu-button');
  var userMenu = document.querySelector('#user-nav');

  burgerMenu.addEventListener('click', function (e) {
    e.stopPropagation();
    toggleNavigation(this, userMenu);
  });

  userMenu.addEventListener('keyup', function (e) {
    if (e.keyCode === ESCAPE) {
      e.stopPropagation();
      closeNavigation(burgerMenu, this);
    }
  });

  if (userMenu.children.length === 0) {
    burgerMenu.style.display = 'none';
  }

  // Toggles expanded aria to collapsible elements
  var collapsible = document.querySelectorAll(
    '.collapsible-nav, .collapsible-sidebar'
  );

  Array.prototype.forEach.call(collapsible, function (el) {
    var toggle = el.querySelector(
      '.collapsible-nav-toggle, .collapsible-sidebar-toggle'
    );

    el.addEventListener('click', function (e) {
      toggleNavigation(toggle, this);
    });

    el.addEventListener('keyup', function (e) {
      if (e.keyCode === ESCAPE) {
        closeNavigation(toggle, this);
      }
    });
  });

  // Submit organization form in the request page
  var requestOrganisationSelect = document.querySelector(
    '#request-organization select'
  );

  if (requestOrganisationSelect) {
    requestOrganisationSelect.addEventListener('change', function () {
      closest(this, 'form').submit();
    });
  }

  // If multibrand search has more than 5 help centers or categories collapse the list
  var multibrandFilterLists = document.querySelectorAll(
    '.multibrand-filter-list'
  );
  Array.prototype.forEach.call(multibrandFilterLists, function (filter) {
    if (filter.children.length > 6) {
      // Display the show more button
      var trigger = filter.querySelector('.see-all-filters');
      trigger.setAttribute('aria-hidden', false);

      // Add event handler for click
      trigger.addEventListener('click', function (e) {
        e.stopPropagation();
        trigger.parentNode.removeChild(trigger);
        filter.classList.remove('multibrand-filter-list--collapsed');
      });
    }
  });

  // If there are any error notifications below an input field, focus that field
  var notificationElm = document.querySelector('.notification-error');
  if (
    notificationElm &&
    notificationElm.previousElementSibling &&
    typeof notificationElm.previousElementSibling.focus === 'function'
  ) {
    notificationElm.previousElementSibling.focus();
  }

  // Dropdowns

  function Dropdown(toggle, menu) {
    this.toggle = toggle;
    this.menu = menu;

    this.menuPlacement = {
      top: menu.classList.contains('dropdown-menu-top'),
      end: menu.classList.contains('dropdown-menu-end'),
    };

    this.toggle.addEventListener('click', this.clickHandler.bind(this));
    this.toggle.addEventListener('keydown', this.toggleKeyHandler.bind(this));
    this.menu.addEventListener('keydown', this.menuKeyHandler.bind(this));
  }

  Dropdown.prototype = {
    get isExpanded() {
      return this.menu.getAttribute('aria-expanded') === 'true';
    },

    get menuItems() {
      return Array.prototype.slice.call(
        this.menu.querySelectorAll("[role='menuitem']")
      );
    },

    dismiss: function () {
      if (!this.isExpanded) return;

      this.menu.setAttribute('aria-expanded', false);
      this.menu.classList.remove('dropdown-menu-end', 'dropdown-menu-top');
    },

    open: function () {
      if (this.isExpanded) return;

      this.menu.setAttribute('aria-expanded', true);
      this.handleOverflow();
    },

    handleOverflow: function () {
      var rect = this.menu.getBoundingClientRect();

      var overflow = {
        right: rect.left < 0 || rect.left + rect.width > window.innerWidth,
        bottom: rect.top < 0 || rect.top + rect.height > window.innerHeight,
      };

      if (overflow.right || this.menuPlacement.end) {
        this.menu.classList.add('dropdown-menu-end');
      }

      if (overflow.bottom || this.menuPlacement.top) {
        this.menu.classList.add('dropdown-menu-top');
      }

      if (this.menu.getBoundingClientRect().top < 0) {
        this.menu.classList.remove('dropdown-menu-top');
      }
    },

    focusNextMenuItem: function (currentItem) {
      if (!this.menuItems.length) return;

      var currentIndex = this.menuItems.indexOf(currentItem);
      var nextIndex =
        currentIndex === this.menuItems.length - 1 || currentIndex < 0
          ? 0
          : currentIndex + 1;

      this.menuItems[nextIndex].focus();
    },

    focusPreviousMenuItem: function (currentItem) {
      if (!this.menuItems.length) return;

      var currentIndex = this.menuItems.indexOf(currentItem);
      var previousIndex =
        currentIndex <= 0 ? this.menuItems.length - 1 : currentIndex - 1;

      this.menuItems[previousIndex].focus();
    },

    clickHandler: function () {
      if (this.isExpanded) {
        this.dismiss();
      } else {
        this.open();
      }
    },

    toggleKeyHandler: function (e) {
      switch (e.keyCode) {
        case ENTER:
        case SPACE:
        case DOWN:
          e.preventDefault();
          this.open();
          this.focusNextMenuItem();
          break;
        case UP:
          e.preventDefault();
          this.open();
          this.focusPreviousMenuItem();
          break;
        case ESCAPE:
          this.dismiss();
          this.toggle.focus();
          break;
      }
    },

    menuKeyHandler: function (e) {
      var firstItem = this.menuItems[0];
      var lastItem = this.menuItems[this.menuItems.length - 1];
      var currentElement = e.target;

      switch (e.keyCode) {
        case ESCAPE:
          this.dismiss();
          this.toggle.focus();
          break;
        case DOWN:
          e.preventDefault();
          this.focusNextMenuItem(currentElement);
          break;
        case UP:
          e.preventDefault();
          this.focusPreviousMenuItem(currentElement);
          break;
        case TAB:
          if (e.shiftKey) {
            if (currentElement === firstItem) {
              this.dismiss();
            } else {
              e.preventDefault();
              this.focusPreviousMenuItem(currentElement);
            }
          } else if (currentElement === lastItem) {
            this.dismiss();
          } else {
            e.preventDefault();
            this.focusNextMenuItem(currentElement);
          }
          break;
        case ENTER:
        case SPACE:
          e.preventDefault();
          currentElement.click();
          break;
      }
    },
  };

  var dropdowns = [];
  var dropdownToggles = Array.prototype.slice.call(
    document.querySelectorAll('.dropdown-toggle')
  );

  dropdownToggles.forEach(function (toggle) {
    var menu = toggle.nextElementSibling;
    if (menu && menu.classList.contains('dropdown-menu')) {
      dropdowns.push(new Dropdown(toggle, menu));
    }
  });

  document.addEventListener('click', function (evt) {
    dropdowns.forEach(function (dropdown) {
      if (!dropdown.toggle.contains(evt.target)) {
        dropdown.dismiss();
      }
    });
  });
  
  // Change "Submit a request" link in article footer to redirect to Knowledge form
  //document.querySelector('.article-more-questions>a').setAttribute('href', 'https://help.fusionsport.com/hc/en-us/requests/new?ticket_form_id=900000481246');

  // Search button on homepage
  const searchButton = document.querySelector('.hero-search-icon');
  if (searchButton) {
    searchButton.onclick = function () {
      const searchValue = document.querySelector(
        '.hero-search-bar #query'
      ).value;
      if (searchValue) {
        window.location.href = `/hc/en-us/search?utf8=✓&query=${encodeURI(
          searchValue
        )}`;
      }
    };
  }

  // Popular search
  const popularSearchItems = document.querySelectorAll('.popular-search-item');
  popularSearchItems.forEach((item) => {
    item.href = `search?utf8=✓&query=${encodeURI(item.innerHTML.trim())}`;
  });

//   /*** Category Grouping ***/

//   //Layout type for groups - single column or two column layout.
//   const groupLayouts = {
//     SINGLE: 1,
//     TWO: 2,
//   };

//   // Load categories only if on homepage.
//   if (document.querySelector('.knowledge-base')) {
//     // Configuring groups for categories
//     const categoryGroups = [
//       //  {
//       //   id: 0,
//       //   title: 'Getting Started',
//       //   description: 'New to Smartabase? Start here',
//       //   icon: smartabaseMobileCategoryIcon,
//       //   layout: groupLayouts.SINGLE,
//       //   sectionIds: ['14827799290900', '14827800227988'],
//       // },
//       // {
//       //   id: 1,
//       //   title: 'Using Smartabase',
//       //   description: 'Ready to start using Smartabase?',
//       //   icon: smartabaseWebCategoryIcon,
//       //   layout: groupLayouts.SINGLE,
//       //   categoryIds: ['14825706723092', '14825706115476', '14825766256660'],
//       // },

//     ];

//     try {
//       let categories, sections;
//       if (sessionStorage.getItem('categories')) {
//         categories = JSON.parse(sessionStorage.getItem('categories'));
//       } else {
//         const categoriesApiResult = await (
//           await fetch('/api/v2/help_center/en-us/categories.json?')
//         ).json();
//         categories = categoriesApiResult.categories;
//         sessionStorage.setItem('categories', JSON.stringify(categories));
//       }

//       if (sessionStorage.getItem('sections')) {
//         sections = JSON.parse(sessionStorage.getItem('sections'));
//       } else {
//         const sectionsApiResult = await (
//           await fetch(`/api/v2/help_center/en-us/sections.json`)
//         ).json();
//         sections = sectionsApiResult.sections;
//         sessionStorage.setItem('sections', JSON.stringify(sections));
//       }

//       // Render each category that is not part of any group individually.
//       const ulElement = document.querySelector('.blocks-list');
//       categories.forEach(async (category) => {
//         const group = categoryGroups.find((cg) =>
//           cg.categoryIds.includes(category.id.toString())
//         );
//         if (!group) {
//           const sectionsForCategory = sections.filter(
//             (s) => s.category_id === category.id
//           );

//           const categoryElement = document.createElement('li');
//           categoryElement.classList.add('blocks-item', 'category-item');
//           categoryElement.id = category.id;

//           const categoryIconElement = document.createElement('img');
//           categoryIconElement.src = generalCategoryIcon;
//           categoryIconElement.width = 82;
//           categoryIconElement.height = 82;
//           categoryIconElement.classList.add('category-item__icon');
//           categoryElement.appendChild(categoryIconElement);

//           const categoryTitleElement = document.createElement('h3');
//           categoryTitleElement.innerHTML = category.name;
//           categoryTitleElement.classList.add('category-item__title');
//           categoryElement.appendChild(categoryTitleElement);

//           if (category.description) {
//             const categoryDescriptionElement = document.createElement('p');
//             categoryDescriptionElement.innerHTML = category.description;
//             categoryDescriptionElement.classList.add(
//               'category-item__description'
//             );
//             categoryElement.appendChild(categoryDescriptionElement);
//           }

//           if (sectionsForCategory.length > 0) {
//             const categorySectionsListElement = document.createElement('ul');
//             categorySectionsListElement.classList.add('category-item-sections');
//             categoryElement.appendChild(categorySectionsListElement);

//             sectionsForCategory.forEach((section) => {
//               const categorySectionElement = document.createElement('li');

//               const categorySectionAnchorElement = document.createElement('a');
//               categorySectionAnchorElement.href = section.html_url;
//               categorySectionElement.appendChild(categorySectionAnchorElement);

//               const categorySectionAnchorTextElement =
//                 document.createElement('span');
//               categorySectionAnchorTextElement.innerHTML = section.name;
//               categorySectionAnchorElement.appendChild(
//                 categorySectionAnchorTextElement
//               );

//               const categorySectionAnchorIconElement =
//                 document.createElement('div');
//               categorySectionAnchorIconElement.classList.add('chevron-right');
//               categorySectionAnchorElement.appendChild(
//                 categorySectionAnchorIconElement
//               );

//               categorySectionsListElement.appendChild(categorySectionElement);
//             });
//           }

//           ulElement.appendChild(categoryElement);
//         }
//       });

//       categoryGroups.forEach((group) => {
//         if (group.categoryIds.length > 0) {
//           const groupElement = document.createElement('li');
//           groupElement.classList.add('blocks-item', 'group-item');
//           if (group.layout === groupLayouts.TWO) {
//             groupElement.classList.add('two-column-layout');
//           }

//           const groupIconElement = document.createElement('img');
//           groupIconElement.src = group.icon;
//           groupIconElement.width = 82;
//           groupIconElement.height = 82;
//           groupIconElement.classList.add('group-item__icon');
//           groupElement.appendChild(groupIconElement);

//           const groupTitleElement = document.createElement('h3');
//           groupTitleElement.innerHTML = group.title;
//           groupTitleElement.classList.add('group-item__title');
//           groupElement.appendChild(groupTitleElement);

//           if (group.description) {
//             const groupDescriptionElement = document.createElement('p');
//             groupDescriptionElement.innerHTML = group.description;
//             groupDescriptionElement.classList.add('group-item__description');
//             groupElement.appendChild(groupDescriptionElement);
//           }

//           const groupCategoriesListElement = document.createElement('ul');
//           groupCategoriesListElement.classList.add('group-item-categories');
//           groupElement.appendChild(groupCategoriesListElement);

//           group.categoryIds.forEach((categoryId) => {
//             const category = categories.find((c) => c.id == categoryId);
//             const groupCategoryElement = document.createElement('li');

//             const groupCategoryAnchorElement = document.createElement('a');
//             groupCategoryAnchorElement.href = category.html_url;
//             groupCategoryElement.appendChild(groupCategoryAnchorElement);

//             const groupCategoryAnchorTextElement =
//               document.createElement('div');
//             groupCategoryAnchorTextElement.innerHTML = category.name;
//             groupCategoryAnchorTextElement.classList.add(
//               'group-item-categories__title'
//             );
//             groupCategoryAnchorElement.appendChild(
//               groupCategoryAnchorTextElement
//             );

//             const groupCategoryAnchorIconElement =
//               document.createElement('div');
//             groupCategoryAnchorIconElement.classList.add('chevron-right');
//             groupCategoryAnchorElement.appendChild(
//               groupCategoryAnchorIconElement
//             );

//             if (category.description) {
//               const groupCategoryAnchorDescriptionElement =
//                 document.createElement('div');
//               groupCategoryAnchorDescriptionElement.innerHTML =
//                 category.description;
//               groupCategoryAnchorDescriptionElement.classList.add(
//                 'group-item-categories__description'
//               );
//               groupCategoryAnchorElement.appendChild(
//                 groupCategoryAnchorDescriptionElement
//               );
//             }

//             groupCategoriesListElement.appendChild(groupCategoryElement);
//           });

//           ulElement.appendChild(groupElement);
//         }
//       });
//     } catch (error) {
//       console.log(error);
//     }
//   }

  // Scroll to top in Article Page
  const scrollToTopElement = document.querySelector('.scroll-to-top-container');
  if (scrollToTopElement) {
    function scrollFunction() {
      if (
        document.body.scrollTop > window.innerHeight ||
        document.documentElement.scrollTop > window.innerHeight
      ) {
        scrollToTopElement.classList.remove('opacity-0');
        const footerTop = document.querySelector('.footer').offsetTop;
        const scrolltop = $(document).scrollTop() + window.innerHeight;
        const difference = scrolltop - footerTop;
        if (scrolltop > footerTop) {
          $('.scroll-to-top-container').css({ bottom: window.innerWidth < 1280 ? Math.max(difference, 64) : difference });
        } else {
          $('.scroll-to-top-container').css({ bottom: window.innerWidth < 1280 ? 64 : 8 });
        }
      } else {
        scrollToTopElement.classList.add('opacity-0');
      }
    }
    window.onscroll = function () {
      scrollFunction();
    };
    window.onresize = function () {
      scrollFunction();
    };

    // When the user clicks on the button, scroll to the top of the document
    function scrollToTop() {
      window.scroll({ top: 0, behavior: 'smooth' });
    }

    scrollToTopElement.querySelector('button').onclick = scrollToTop;
  }

  // Custom 'More articles in section' on article page
  const articleContainer = document.getElementById('article-container');
  if (articleContainer) {
    try {
      const currentArticleId = articleContainer.getAttribute('data-article-id');
      const sectionId = articleContainer.getAttribute('data-section-id');
      let articlesInSection;

      if (sessionStorage.getItem('articles')) {
        articlesInSection = JSON.parse(sessionStorage.getItem('articles')).find(
          (s) => s.sectionId == sectionId
        )?.articles;
      } else {
        sessionStorage.setItem('articles', JSON.stringify([]));
      }
      if (!articlesInSection) {
        const apiResult = await (
          await fetch(
            `/api/v2/help_center/en-us/sections/${sectionId}/articles.json?sort_by=position`
          )
        ).json();

        articlesInSection = apiResult.articles
          .filter((a) => a.draft === false)
          .map((a) => {
            return {
              id: a.id,
              url: a.html_url,
              title: a.title,
              position: a.position,
            };
          });
        const articlesInSession = JSON.parse(
          sessionStorage.getItem('articles')
        );
        articlesInSession.push({
          sectionId,
          articles: articlesInSection,
        });
        sessionStorage.setItem('articles', JSON.stringify(articlesInSession));
      }

      // Filter articles based on position and show 15 similar articles
      const currentArticle = articlesInSection.find(
        (a) => a.id == currentArticleId
      );

      // Assuming the current article is in 'middle'
      /* 
      const startIndex = currentArticle.position - 7;
      const endIndex = currentArticle.position + 7; 
      */
      const currentArticleIndex = articlesInSection.indexOf(currentArticle);
      const startIndex = currentArticleIndex - 7;
      const endIndex = currentArticleIndex + 7;
      const numberOfArticles = articlesInSection.length;

      if (startIndex < 0 || articlesInSection.length < 15) {
        articlesInSection = articlesInSection.splice(0, 15);
      } else if (endIndex > articlesInSection.length) {
        articlesInSection = articlesInSection.splice(
          articlesInSection.length - 15,
          15
        );
      } else {
        articlesInSection = articlesInSection.splice(startIndex, 15);
      }

      // Display articles
      const listElement = document.querySelector(
        '.collapsible-sidebar-body ul'
      );
      articlesInSection.forEach((article) => {
        const listItemElement = document.createElement('li');
        const listItemAnchorElement = document.createElement('a');
        listItemAnchorElement.href = article.url;
        listItemAnchorElement.classList.add('sidenav-item');
        if (article.id == currentArticleId) {
          listItemAnchorElement.classList.add('current-article');
        }
        listItemAnchorElement.innerHTML = article.title;
        listItemElement.appendChild(listItemAnchorElement);

        listElement.appendChild(listItemElement);
      });

      // Show 'See more' link if there are more than 15 articles in the section
      if (numberOfArticles > 15) {
        const showMoreLinkElement = document.querySelector('.show-more');
        showMoreLinkElement.classList.remove('visibility-hidden');
      }
    } catch (error) {
      console.log(error);
    }
  }
});

// Disable departments question in web widget
  window.zESettings = {
    webWidget: {
      chat: {
        departments: {
          enabled: []
        }
      }
    }
  };
  document.addEventListener('DOMContentLoaded', async function () {
  // Article label to be considered for the alerts
  const label = 'alert'

  // Show the article body within the alertbox? (Boolean: true/false)
  const showArticleBody = true

  // Get current help center locale
  const locale = document
    .querySelector('html')
    .getAttribute('lang')
    .toLowerCase()

  // URL to be called to get the alert data
  const url = `/api/v2/help_center/${locale}/articles.json?label_names=${label}`

  // Raw data collected from the endpoint above
  const data = await (await fetch(url)).json()

  // List of articles returned
  const articles = (data && data.articles) || []

  // Handle returned articles
  for (let i = 0; i < articles.length; i++) {
    const url = articles[i].html_url
    const title = articles[i].title
    const body = articles[i].body

    const html = `
      <div class="ns-box ns-bar ns-effect-slidetop ns-type-notice ns-show">
        <div class="ns-box-inner">
          <span class="megaphone"></span>
          <p>

            ${showArticleBody ? body : ''}
          </p>
        </div>
        <span class="ns-close"></span>
      </div>
    `

    // Append current alert to the alertbox container
    document.querySelector('.alertbox').insertAdjacentHTML('beforeend', html)
  }
})

document.addEventListener('click', function (event) {
  // Close alertbox
  if (event.target.matches('.ns-close')) {
    event.preventDefault()
    event.target.parentElement.remove()
  }
})

// Expand and collapse sections within articles //
document.addEventListener('DOMContentLoaded', function() {
  var acc = document.getElementsByClassName("accordion");
  var i;

  for (i = 0; i < acc.length; i++) {
    acc[i].addEventListener("click", function() {
      this.classList.toggle("active");
      var panel = this.nextElementSibling;
      if (panel.style.maxHeight) {
        panel.style.maxHeight = null;
      } else {
        panel.style.maxHeight = panel.scrollHeight + "px";
      }
    });
  }
});

// Hide blocks-item if blocks-item-title = "Category 1"
document.addEventListener('DOMContentLoaded', function() {
  var nav_item = document.getElementsByClassName("nav-item");

  for (var i = 0; i < nav_item.length; i++) {
    if (nav_item[i].innerHTML == "Default") {
      nav_item[i].style.display = "none";
    }
  }
});

// Hide blocks-item if blocks-item-title = "Category 1"
document.addEventListener('DOMContentLoaded', function() {
  var blocksItemTitle = document.getElementsByClassName("blocks-item-title");
  var blocksItem = document.getElementsByClassName("blocks-item");

  for (var i = 0; i < blocksItemTitle.length; i++) {
    if (blocksItemTitle[i].innerHTML == "Category 1") {
      blocksItem[i].style.display = "none";
    }
  }
});
// Get all tab containers
let tabContainers = document.querySelectorAll(".tab-container");  // Assuming a class name, adjust as necessary

tabContainers.forEach((container) => {
  // Get tabs and tab contents within the current container
  let tabs = container.querySelectorAll(".tabs h3");
  let tabContents = container.querySelectorAll(".tab-content div");

  tabs.forEach((tab, index) => {
    tab.addEventListener("click", () => {
      // Remove active class from all tab contents in the current container
      tabContents.forEach((content) => {
        content.classList.remove("active-tab");
      });

      // Remove active class from all tabs in the current container
      tabs.forEach((tab) => {
        tab.classList.remove("active-tab");
      });

      // Add active class to clicked tab and its corresponding content
      tabContents[index].classList.add("active-tab");
      tabs[index].classList.add("active-tab");
    });
  });
});


// // Redirection from Smartabase Zendesk to Teamworks Zendesk
// var oldIds = ["4411598067481", "15009881706388"];
//   var newIds = ["5139709475097", "15009883287188"];

//   for (var i = 0; i < oldIds.length; i++){
//     if (window.location.href.indexOf(oldIds[i]) > -1) {
//       window.location.href = 'https://teamworks.zendesk.com/hc/en-us/articles/' + newIds[i]; 
//     }
//   }
