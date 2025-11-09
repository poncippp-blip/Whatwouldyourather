// Application Initialization
document.addEventListener('DOMContentLoaded', () => {
    // Initialize video generator
    const generator = new VideoGenerator();

    // Prompt Manager Modal Setup
    const promptManagerBtn = document.getElementById('promptManagerBtn');
    if (promptManagerBtn) {
        promptManagerBtn.addEventListener('click', () => {
            showPromptManager();
        });
    }

    function showPromptManager() {
        const modal = createPromptManagerModal();
        document.body.appendChild(modal);
        modal.style.display = 'flex';
    }

    function createPromptManagerModal() {
        const modal = document.createElement('div');
        modal.id = 'promptManagerModal';
        modal.style.cssText = `
            position: fixed;
            inset: 0;
            background: rgba(0, 0, 0, 0.8);
            backdrop-filter: blur(10px);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 1000;
            padding: 20px;
        `;

        const container = document.createElement('div');
        container.style.cssText = `
            background: var(--bg-secondary);
            border: 1px solid var(--border-medium);
            border-radius: var(--radius-lg);
            max-width: 600px;
            width: 100%;
            max-height: 80vh;
            overflow-y: auto;
        `;

        const header = document.createElement('div');
        header.style.cssText = `
            padding: var(--space-lg);
            border-bottom: 1px solid var(--border-subtle);
            display: flex;
            align-items: center;
            justify-content: space-between;
        `;

        const title = document.createElement('h2');
        title.textContent = 'Prompt Manager';
        title.style.cssText = 'font-size: 18px; font-weight: 600;';

        const closeBtn = document.createElement('button');
        closeBtn.textContent = '✕';
        closeBtn.className = 'btn btn-ghost btn-sm';
        closeBtn.onclick = () => modal.remove();

        header.appendChild(title);
        header.appendChild(closeBtn);

        const body = document.createElement('div');
        body.style.cssText = 'padding: var(--space-lg);';

        // Add prompt form
        const form = document.createElement('div');
        form.style.cssText = 'margin-bottom: var(--space-lg);';
        form.innerHTML = `
            <div class="form-group">
                <label class="form-label">Add New Prompt</label>
                <div style="display: flex; gap: var(--space-sm); margin-bottom: var(--space-sm);">
                    <input type="text" class="form-input" id="newOption1" placeholder="Option 1" style="margin-bottom: 0;">
                    <input type="text" class="form-input" id="newOption2" placeholder="Option 2" style="margin-bottom: 0;">
                </div>
                <button class="btn btn-primary btn-sm" id="addPromptBtn">Add Prompt</button>
            </div>
        `;

        // Prompt list
        const promptList = document.createElement('div');
        promptList.id = 'promptListContainer';
        promptList.style.cssText = `
            max-height: 400px;
            overflow-y: auto;
        `;

        const actions = document.createElement('div');
        actions.style.cssText = `
            display: flex;
            gap: var(--space-sm);
            margin-top: var(--space-lg);
            padding-top: var(--space-lg);
            border-top: 1px solid var(--border-subtle);
        `;

        const exportBtn = document.createElement('button');
        exportBtn.textContent = '📤 Export';
        exportBtn.className = 'btn btn-secondary btn-sm';
        exportBtn.onclick = () => exportPrompts();

        const importBtn = document.createElement('button');
        importBtn.textContent = '📥 Import';
        importBtn.className = 'btn btn-secondary btn-sm';
        importBtn.onclick = () => importPrompts();

        const resetBtn = document.createElement('button');
        resetBtn.textContent = '🔄 Reset to Defaults';
        resetBtn.className = 'btn btn-secondary btn-sm';
        resetBtn.onclick = () => {
            if (confirm('Reset to default prompts? This will delete all custom prompts.')) {
                generator.promptManager.resetToDefaults();
                renderPromptList();
            }
        };

        actions.appendChild(exportBtn);
        actions.appendChild(importBtn);
        actions.appendChild(resetBtn);

        body.appendChild(form);
        body.appendChild(promptList);
        body.appendChild(actions);

        container.appendChild(header);
        container.appendChild(body);
        modal.appendChild(container);

        // Event listeners
        const addBtn = form.querySelector('#addPromptBtn');
        const opt1Input = form.querySelector('#newOption1');
        const opt2Input = form.querySelector('#newOption2');

        addBtn.onclick = () => {
            const opt1 = opt1Input.value.trim();
            const opt2 = opt2Input.value.trim();

            if (opt1 && opt2) {
                generator.promptManager.addPrompt(opt1, opt2);
                opt1Input.value = '';
                opt2Input.value = '';
                renderPromptList();
            } else {
                alert('Please enter both options');
            }
        };

        function renderPromptList() {
            const allPrompts = generator.promptManager.getAllPrompts();
            const customCount = generator.promptManager.customPrompts.length;

            promptList.innerHTML = '';

            if (allPrompts.length === 0) {
                promptList.innerHTML = '<p style="color: var(--text-tertiary); text-align: center; padding: var(--space-lg);">No prompts available</p>';
                return;
            }

            allPrompts.forEach((prompt, index) => {
                const isCustom = index < customCount;
                const item = document.createElement('div');
                item.style.cssText = `
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: var(--space-md);
                    background: var(--surface-1);
                    border: 1px solid var(--border-subtle);
                    border-radius: var(--radius-sm);
                    margin-bottom: var(--space-sm);
                `;

                const text = document.createElement('span');
                text.textContent = `${prompt[0]} or ${prompt[1]}`;
                text.style.cssText = 'font-size: 13px; color: var(--text-secondary);';

                const actions = document.createElement('div');
                actions.style.cssText = 'display: flex; gap: var(--space-xs);';

                if (isCustom) {
                    const deleteBtn = document.createElement('button');
                    deleteBtn.textContent = '🗑️';
                    deleteBtn.className = 'btn btn-ghost btn-sm';
                    deleteBtn.onclick = () => {
                        generator.promptManager.removePrompt(index);
                        renderPromptList();
                    };
                    actions.appendChild(deleteBtn);
                } else {
                    const badge = document.createElement('span');
                    badge.textContent = 'Default';
                    badge.style.cssText = `
                        font-size: 11px;
                        color: var(--text-tertiary);
                        padding: 2px 8px;
                        background: var(--surface-2);
                        border-radius: 4px;
                    `;
                    actions.appendChild(badge);
                }

                item.appendChild(text);
                item.appendChild(actions);
                promptList.appendChild(item);
            });
        }

        function exportPrompts() {
            const json = generator.promptManager.exportPrompts();
            const blob = new Blob([json], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'would-you-rather-prompts.json';
            a.click();
            URL.revokeObjectURL(url);
        }

        function importPrompts() {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = '.json';
            input.onchange = (e) => {
                const file = e.target.files[0];
                if (file) {
                    const reader = new FileReader();
                    reader.onload = (event) => {
                        try {
                            const prompts = JSON.parse(event.target.result);
                            if (Array.isArray(prompts)) {
                                generator.promptManager.importPrompts(prompts);
                                renderPromptList();
                                alert('Prompts imported successfully!');
                            } else {
                                alert('Invalid prompt file format');
                            }
                        } catch (error) {
                            alert('Error importing prompts: ' + error.message);
                        }
                    };
                    reader.readAsText(file);
                }
            };
            input.click();
        }

        renderPromptList();

        return modal;
    }

    console.log('🚀 WouldYouRather.ai initialized successfully!');
});
