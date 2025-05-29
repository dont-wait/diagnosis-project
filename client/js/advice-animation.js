

class AdviceAnimation {

    constructor(options = {}) {
        this.container = options.container || document.getElementById('aiAdviceContent');
        this.typingAnimation = new TypingAnimation({
            typingSpeed: options.typingSpeed || 20,
            pauseBetweenWords: options.pauseBetweenWords || 80,
            pauseBetweenSentences: options.pauseBetweenSentences || 400,
            pauseBetweenParagraphs: options.pauseBetweenParagraphs || 700,
            onComplete: options.onComplete || (() => {
                console.log('Typing animation complete');
                this._showSkipButton(false);
            }),
            onProgress: options.onProgress || ((progress) => {
                // Cập nhật thanh tiến trình nếu có
                const progressBar = document.getElementById('typingProgressBar');
                if (progressBar) {
                    progressBar.style.width = `${progress}%`;
                }
            })
        });

        this.isAnimating = false;
        this._createProgressBar();
        this._createSkipButton();
    }

    _createProgressBar() {
        const progressContainer = document.createElement('div');
        progressContainer.id = 'typingProgressContainer';
        progressContainer.className = 'h-1 bg-gray-200 rounded-full overflow-hidden mt-2 mb-4';

        const progressBar = document.createElement('div');
        progressBar.id = 'typingProgressBar';
        progressBar.className = 'h-full bg-blue-500 transition-all duration-300 ease-out';
        progressBar.style.width = '0%';

        // Thêm hiệu ứng gradient cho thanh tiến trình
        progressBar.style.backgroundImage = 'linear-gradient(to right, #ff00b7, #d51297, #0bff3c)';
        progressBar.style.backgroundSize = '200% 100%';
        progressBar.style.animation = 'gradient-shift 2s ease infinite';

        // Thêm style cho animation gradient
        const style = document.createElement('style');
        style.textContent = `
        @keyframes gradient-shift {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
        }
    `;
        document.head.appendChild(style);
        progressContainer.appendChild(progressBar);


        this.progressContainer = progressContainer;
    }

    /**
     * Tạo nút bỏ qua animation
     * @private
     */
    _createSkipButton() {
        const skipButton = document.createElement('button');
        skipButton.id = 'skipTypingButton';
        skipButton.className = 'text-sm text-blue-600 hover:text-blue-800 flex items-center absolute top-4 right-4';
        skipButton.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 5l7 7-7 7M5 5l7 7-7 7" />
            </svg>
            Hiển thị ngay
        `;

        skipButton.addEventListener('click', () => {
            this.typingAnimation.complete();
        });

        // Lưu trữ để thêm vào container khi cần
        this.skipButton = skipButton;
    }

    /**
     * Hiển thị hoặc ẩn nút bỏ qua
     * 
     * @param {boolean} show - Có hiển thị nút hay không
     * @private
     */
    _showSkipButton(show) {
        if (this.skipButton) {
            if (show) {
                this.skipButton.style.display = 'flex';
            } else {
                this.skipButton.style.display = 'none';
            }
        }
    }

    /**
     * Tạo cấu trúc HTML cho lời khuyên
     * 
     * @param {Object} advice - Đối tượng chứa lời khuyên
     * @returns {string} HTML cho lời khuyên
     * @private
     */
    _createAdviceHtml(advice) {
        return `
        <div class="space-y-4">
            <div class="mb-6 pb-4 border-b border-blue-200">
                <h4 class="text-lg font-semibold text-blue-800 mb-2">Tóm tắt</h4>
                <p id="advice-summary" class="text-gray-700 text-justify"></p>
            </div>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <h5 class="font-semibold text-blue-700 mb-2 flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Mức độ nguy hiểm
                    </h5>
                    <p id="advice-danger" class="text-gray-700 text-justify"></p>
                </div>
                
                <div>
                    <h5 class="font-semibold text-blue-700 mb-2 flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Triệu chứng cần theo dõi
                    </h5>
                    <p id="advice-symptoms" class="text-gray-700 text-justify"></p>
                </div>
                
                <div>
                    <h5 class="font-semibold text-blue-700 mb-2 flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                        Hành động cần thực hiện ngay
                    </h5>
                    <p id="advice-actions" class="text-gray-700 text-justify"></p>
                </div>
                
                <div>
                    <h5 class="font-semibold text-blue-700 mb-2 flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                        Chế độ ăn uống khuyến nghị
                    </h5>
                    <p id="advice-diet" class="text-gray-700 text-justify"></p>
                </div>
                
                <div class="md:col-span-2">
                    <h5 class="font-semibold text-blue-700 mb-2 flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        Thời điểm cần đi khám
                    </h5>
                    <p id="advice-doctor" class="text-gray-700 text-justify"></p>
                </div>
            </div>
        </div>
    `;
    }

    /**
     * Hiển thị lời khuyên với hiệu ứng đánh máy
     * 
     * @param {Object} advice - Đối tượng chứa lời khuyên
     */
    animateAdvice(advice) {
        if (this.isAnimating) {
            this.typingAnimation.stop();
        }

        // Thiết lập container
        this.container.innerHTML = this._createAdviceHtml(advice);

        // Thêm thanh tiến trình và nút bỏ qua
        this.container.insertBefore(this.progressContainer, this.container.firstChild);
        this.container.style.position = 'relative';
        this.container.appendChild(this.skipButton);
        this._showSkipButton(true);

        document.getElementById('typingProgressBar').style.width = '0%';

        this.typingAnimation.stop();
        this.typingAnimation.queue = [];
        this.typingAnimation.totalCharacters = 0;
        this.typingAnimation.typedCharacters = 0;
        this.typingAnimation.currentIndex = 0;
        this.typingAnimation.processedItems = 0;


        // Thêm các phần văn bản vào hàng đợi
        this.typingAnimation.addTextToQueue(
            document.getElementById('advice-summary'),
            advice.summary || 'Không có dữ liệu'
        );

        this.typingAnimation.addPause(300);

        this.typingAnimation.addTextToQueue(
            document.getElementById('advice-danger'),
            advice.danger_level || 'Không rõ'
        );

        this.typingAnimation.addPause(200);

        this.typingAnimation.addTextToQueue(
            document.getElementById('advice-symptoms'),
            advice.symptoms_to_watch || 'Không rõ'
        );

        this.typingAnimation.addPause(200);

        this.typingAnimation.addTextToQueue(
            document.getElementById('advice-actions'),
            advice.immediate_actions || 'Không rõ'
        );

        this.typingAnimation.addPause(200);

        this.typingAnimation.addTextToQueue(
            document.getElementById('advice-diet'),
            advice.diet || 'Không rõ'
        );

        this.typingAnimation.addPause(200);

        this.typingAnimation.addTextToQueue(
            document.getElementById('advice-doctor'),
            advice.doctor_visit_timing || 'Không rõ'
        );

        // Bắt đầu animation
        this.isAnimating = true;
        this.typingAnimation.start();
    }

    /**
     * Dừng animation hiện tại
     */
    stop() {
        if (this.isAnimating) {
            this.typingAnimation.stop();
            this.isAnimating = false;
            this._showSkipButton(false);
        }
    }

    /**
     * Hoàn thành ngay lập tức animation, hiển thị toàn bộ nội dung
     */
    complete() {
        if (this.isAnimating) {
            this.typingAnimation.complete();
            this.isAnimating = false;
            this._showSkipButton(false);
        }
    }
}

// Xuất lớp để sử dụng trong các file khác
if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
    module.exports = AdviceAnimation;
} else {
    window.AdviceAnimation = AdviceAnimation;
}