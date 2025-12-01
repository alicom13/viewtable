/*!
 * ViewTable v1.2.1 - ViewTable JS
 * Description: ViewTable is a JavaScript library that transforms HTML table structures 
 * into a mobile-friendly layout with a toggle rows system. It dynamically converts 
 * table HTML markup into an optimized format for mobile viewing and interaction.
 * @copyright 2025
 * @author    Ali Musthofa
 * @link      https://github.com/alicom13
 * @license   MIT
 */

(function() {
    'use strict';

    class ViewTable {
        constructor(tableElement) {
            this.table = tableElement;
            this.config = {
                mobileCols: tableElement.dataset.mobileCols ? 
                    tableElement.dataset.mobileCols.split(',').map(col => col.trim()) : null,
                breakpoint: 768
            };
            this.mobileContainer = null;
            this.init();
        }

        init() {
            this.createMobileContainer();
            this.checkView();
            window.addEventListener('resize', () => this.checkView());
        }

        createMobileContainer() {
            this.mobileContainer = document.createElement('div');
            this.mobileContainer.className = 'viewtable-mobile-container';
            this.table.parentNode.insertBefore(this.mobileContainer, this.table.nextSibling);
        }

        generateMobileView() {
            const headers = Array.from(this.table.querySelectorAll('thead th')).map(th => th.textContent.trim());
            const rows = this.table.querySelectorAll('tbody tr');
            
            const visibleHeaders = this.config.mobileCols || headers.slice(0, 3);
            const detailHeaders = headers.filter(h => !visibleHeaders.includes(h));
            
            let html = `<div class="viewtable-mobile-table"><div class="viewtable-mobile-header">`;
            
            visibleHeaders.forEach(header => {
                html += `<div class="viewtable-mobile-col">${header}</div>`;
            });
            html += `<div class="viewtable-mobile-col-toggle"></div></div>`;
            
            rows.forEach((row, rowIndex) => {
                const cells = Array.from(row.querySelectorAll('td'));
                
                html += `<div class="viewtable-mobile-row" data-row-index="${rowIndex}"><div class="viewtable-mobile-row-main">`;
                
                visibleHeaders.forEach(header => {
                    const index = headers.indexOf(header);
                    const value = cells[index] ? cells[index].innerHTML.trim() : '';
                    html += `<div class="viewtable-mobile-cell">${value}</div>`;
                });
                
                html += `<div class="viewtable-mobile-toggle"><span class="viewtable-toggle-arrow">▼</span></div></div>`;
                html += `<div class="viewtable-mobile-details" id="mobile-details-${rowIndex}">`;
                
                detailHeaders.forEach(header => {
                    const index = headers.indexOf(header);
                    if (cells[index]) {
                        const value = cells[index].innerHTML.trim();
                        html += `<div class="viewtable-detail-item"><span class="viewtable-detail-label">${header}:</span><span class="viewtable-detail-value">${value}</span></div>`;
                    }
                });
                
                html += `</div></div>`;
            });
            
            html += `</div>`;
            this.mobileContainer.innerHTML = html;
            
            this.mobileContainer.addEventListener('click', (e) => {
                const row = e.target.closest('.viewtable-mobile-row');
                if (row) this.toggleRowDetails(row);
            });
        }

        toggleRowDetails(rowElement) {
            const rowIndex = rowElement.dataset.rowIndex;
            const details = document.getElementById(`mobile-details-${rowIndex}`);
            const toggle = rowElement.querySelector('.viewtable-toggle-arrow');
            if (!details) return;
            
            const isOpen = details.style.display === 'block';
            details.style.display = isOpen ? 'none' : 'block';
            toggle.textContent = isOpen ? '▼' : '▲';
        }

        checkView() {
            const isMobile = window.innerWidth <= this.config.breakpoint;
            if (isMobile) {
                this.table.style.display = 'none';
                this.mobileContainer.style.display = 'block';
                if (this.mobileContainer.children.length === 0) this.generateMobileView();
            } else {
                this.table.style.display = 'table';
                this.mobileContainer.style.display = 'none';
            }
        }
    }

    document.addEventListener('DOMContentLoaded', () => {
        document.querySelectorAll('[data-viewtable]').forEach(table => {
            new ViewTable(table);
        });
    });

})();
