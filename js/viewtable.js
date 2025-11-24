/*!
 * ViewTable v1.0.0 - Responsive Table Library
 * Zero-dependency, lightweight table-to-mobile transformation
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

        parseConfig() {
            return {
                visibleColumns: parseInt(this.table.dataset.visibleColumns) || 3,
                mobileCols: this.table.dataset.mobileCols ? 
                    this.table.dataset.mobileCols.split(',').map(col => col.trim()) : null,
                breakpoint: parseInt(this.table.dataset.breakpoint) || 768,
                tableClass: this.table.dataset.tableClass || 'viewtable',
                cardClass: this.table.dataset.cardClass || 'viewtable-card',
            };
        }

        init() {
            this.createMobileContainer();
            this.setupResponsiveBehavior();
            this.checkView();
        }

        createMobileContainer() {
            this.mobileContainer = document.createElement('div');
            this.mobileContainer.className = 'viewtable-mobile-container';
            this.table.parentNode.insertBefore(this.mobileContainer, this.table.nextSibling);
        }

        generateMobileView() {
            const headers = Array.from(this.table.querySelectorAll('thead th')).map(th => th.textContent.trim());
            const rows = this.table.querySelectorAll('tbody tr');
            
            // Determine which columns to show
            const visibleHeaders = this.getVisibleHeaders(headers);
            
            let mobileHTML = `
                <div class="viewtable-mobile-table">
                    <div class="viewtable-mobile-header">
            `;
            
            // Create header row
            visibleHeaders.forEach(header => {
                mobileHTML += `<div class="viewtable-mobile-col">${header}</div>`;
            });
            mobileHTML += `<div class="viewtable-mobile-col-toggle"></div>`;
            mobileHTML += `</div>`; // Close header
            
            // Create data rows
            rows.forEach((row, rowIndex) => {
                const cells = row.querySelectorAll('td');
                
                mobileHTML += `
                    <div class="viewtable-mobile-row" data-row-index="${rowIndex}">
                        <div class="viewtable-mobile-row-main">
                `;
                
                // Visible columns data
                visibleHeaders.forEach(header => {
                    const colIndex = headers.indexOf(header);
                    const value = cells[colIndex]?.innerHTML.trim() || '';
                    mobileHTML += `<div class="viewtable-mobile-cell">${value}</div>`;
                });
                
                // Toggle column
                mobileHTML += `
                            <div class="viewtable-mobile-toggle">
                                <span class="viewtable-toggle-arrow">▼</span>
                            </div>
                        </div>
                        <div class="viewtable-mobile-details" id="mobile-details-${rowIndex}">
                `;
                
                // Hidden columns (details)
                headers.forEach((header, colIndex) => {
                    if (!visibleHeaders.includes(header)) {
                        const value = cells[colIndex].innerHTML.trim();
                        mobileHTML += `
                            <div class="viewtable-detail-item">
                                <span class="viewtable-detail-label">${header}:</span>
                                <span class="viewtable-detail-value">${value}</span>
                            </div>
                        `;
                    }
                });
                
                mobileHTML += `</div></div>`; // Close details and row
            });
            
            mobileHTML += `</div>`; // Close table
            this.mobileContainer.innerHTML = mobileHTML;
            
            // Add event listeners
            this.setupMobileInteractions();
        }

        getVisibleHeaders(allHeaders) {
            if (this.config.mobileCols) {
                return this.config.mobileCols;
            }
            return allHeaders.slice(0, this.config.visibleColumns);
        }

        setupMobileInteractions() {
            // Click on row to toggle details
            this.mobileContainer.addEventListener('click', (e) => {
                const row = e.target.closest('.viewtable-mobile-row');
                if (row) {
                    this.toggleRowDetails(row);
                }
            });
        }

        toggleRowDetails(rowElement) {
            const rowIndex = rowElement.dataset.rowIndex;
            const details = document.getElementById(`mobile-details-${rowIndex}`);
            const toggle = rowElement.querySelector('.viewtable-toggle-arrow');
            const isOpen = details.style.display === 'block';
            
            // Toggle current row
            details.style.display = isOpen ? 'none' : 'block';
            toggle.textContent = isOpen ? '▼' : '▲';
            
            // Optional: Close other open rows
            this.closeOtherRows(rowIndex);
        }

        closeOtherRows(currentRowIndex) {
            document.querySelectorAll('.viewtable-mobile-row').forEach(row => {
                const rowIndex = row.dataset.rowIndex;
                if (rowIndex !== currentRowIndex) {
                    const details = document.getElementById(`mobile-details-${rowIndex}`);
                    const toggle = row.querySelector('.viewtable-toggle-arrow');
                    if (details && details.style.display === 'block') {
                        details.style.display = 'none';
                        toggle.textContent = '▼';
                    }
                }
            });
        }

        setupResponsiveBehavior() {
            // Handled by checkView()
        }

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

        // Public API
        refresh() {
            this.mobileContainer.innerHTML = '';
            this.generateMobileView();
        }

        updateConfig(newConfig) {
            this.config = { ...this.config, ...newConfig };
            this.refresh();
        }

        destroy() {
            if (this.mobileContainer && this.mobileContainer.parentNode) {
                this.mobileContainer.parentNode.removeChild(this.mobileContainer);
            }
            this.table.style.display = 'table';
        }
    }

    // Auto-initialization
    function initializeAllTables() {
        const tables = document.querySelectorAll('[data-viewtable]');
        tables.forEach(table => {
            // Avoid double initialization
            if (!table._viewtableInstance) {
                table._viewtableInstance = new ViewTable(table);
            }
        });
    }

    // DOM Ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeAllTables);
    } else {
        initializeAllTables();
    }

    // Responsive handling with debounce
    let resizeTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            const tables = document.querySelectorAll('[data-viewtable]');
            tables.forEach(table => {
                if (table._viewtableInstance) {
                    table._viewtableInstance.checkView();
                }
            });
        }, 100);
    });

    // Public API
    window.ViewTable = {
        init: (selector = '[data-viewtable]') => {
            const tables = document.querySelectorAll(selector);
            return Array.from(tables).map(table => new ViewTable(table));
        },
        
        getInstance: (tableElement) => {
            return tableElement._viewtableInstance || null;
        },
        
        refreshAll: () => {
            const tables = document.querySelectorAll('[data-viewtable]');
            tables.forEach(table => {
                if (table._viewtableInstance) {
                    table._viewtableInstance.refresh();
                }
            });
        }
    };

})();
