/*!
 * ViewTable v1.0.0
 * A lightweight, zero-dependency library to make HTML tables responsive.
 * Converts a standard table into a card layout on mobile devices.
 * 
 * Author: 
 * License: MIT
 */

(function() {
    'use strict';

    class ViewTable {
        constructor(tableElement) {
            this.table = tableElement;
            this.config = this.parseConfig();
            this.mobileContainer = null;
            this.init();
        }

        // Parse configuration from data-* attributes
        parseConfig() {
            return {
                visibleColumns: parseInt(this.table.dataset.visibleColumns) || 2,
                mobileTitleIndex: parseInt(this.table.dataset.mobileTitle) || 0,
                breakpoint: parseInt(this.table.dataset.breakpoint) || 768,
                // Class prefixes to avoid conflicts
                tableClass: this.table.dataset.tableClass || 'viewtable',
                cardClass: this.table.dataset.cardClass || 'viewtable-card',
            };
        }

        init() {
            this.createMobileContainer();
            this.setupResponsiveToggle();
            this.checkView();
        }

        createMobileContainer() {
            this.mobileContainer = document.createElement('div');
            this.mobileContainer.className = `${this.config.cardClass}-container`;
            // Insert the mobile container right after the table
            this.table.parentNode.insertBefore(this.mobileContainer, this.table.nextSibling);
        }
        
        // Main function to generate the mobile view HTML
        generateMobileView() {
            const headers = Array.from(this.table.querySelectorAll('thead th')).map(th => th.textContent.trim());
            const rows = this.table.querySelectorAll('tbody tr');

            let cardsHTML = '';
            rows.forEach(row => {
                const cells = row.querySelectorAll('td');
                const title = cells[this.config.mobileTitleIndex].textContent.trim();
                
                let cardBodyItems = '';
                for (let i = 0; i < cells.length; i++) {
                    // Skip the column used for the title
                    if (i === this.config.mobileTitleIndex) continue;
                    
                    const label = headers[i];
                    const value = cells[i].innerHTML.trim(); // Use innerHTML to preserve potential tags like <strong>
                    cardBodyItems += `<div class="${this.config.cardClass}-item"><span class="${this.config.cardClass}-label">${label}:</span><span>${value}</span></div>`;
                }

                cardsHTML += `
                    <div class="${this.config.cardClass}">
                        <div class="${this.config.cardClass}-header">
                            <span>${title}</span>
                            <span class="${this.config.cardClass}-toggle">▼</span>
                        </div>
                        <div class="${this.config.cardClass}-body">
                            ${cardBodyItems}
                        </div>
                    </div>
                `;
            });
            this.mobileContainer.innerHTML = cardsHTML;
        }

        // Toggle the mobile card open/close state
        setupMobileToggle() {
            // Use event delegation for efficiency
            document.addEventListener('click', (e) => {
                if (e.target.classList.contains(`${this.config.cardClass}-toggle`) || e.target.classList.contains(`${this.config.cardClass}-header`)) {
                    const card = e.target.closest(`.${this.config.cardClass}`);
                    const body = card.querySelector(`.${this.config.cardClass}-body`);
                    const toggle = card.querySelector(`.${this.config.cardClass}-toggle`);

                    if (body && toggle) {
                        const isOpen = body.style.display === 'block';
                        body.style.display = isOpen ? 'none' : 'block';
                        toggle.textContent = isOpen ? '▼' : '▲';
                        toggle.classList.toggle('is-open', !isOpen);
                    }
                }
            });
        }

        // Check viewport and toggle views accordingly
        checkView() {
            const isMobile = window.innerWidth <= this.config.breakpoint;
            if (isMobile) {
                this.table.style.display = 'none';
                this.mobileContainer.style.display = 'block';
                if (this.mobileContainer.children.length === 0) {
                    this.generateMobileView();
                }
            } else {
                this.table.style.display = 'table';
                this.mobileContainer.style.display = 'none';
            }
        }
    }

    // --- Auto-Initialization ---
    // This function will find all tables with the 'data-viewtable' attribute
    // and initialize them automatically.
    function initializeAllTables() {
        const tables = document.querySelectorAll('[data-viewtable]');
        tables.forEach(table => new ViewTable(table));
    }

    // Initialize when the DOM is fully loaded
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeAllTables);
    } else {
        initializeAllTables();
    }

    // Re-check view on window resize
    let resizeTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(initializeAllTables, 150);
    });

})();
