/**
 * Typing Animation
 * 
 * Tạo hiệu ứng đánh máy cho văn bản, giống như AI đang gõ từng từ một.
 
 */

class TypingAnimation {
    /**
     * Khởi tạo đối tượng TypingAnimation
     * 
     * @param {Object} options - Các tùy chọn cho animation
     * @param {number} options.typingSpeed - Tốc độ gõ (ms)
     * @param {number} options.pauseBetweenWords - Thời gian tạm dừng giữa các từ (ms)
     * @param {number} options.pauseBetweenSentences - Thời gian tạm dừng giữa các câu (ms)
     * @param {number} options.pauseBetweenParagraphs - Thời gian tạm dừng giữa các đoạn (ms)
     * @param {Function} options.onComplete - Callback khi animation hoàn thành
     * @param {Function} options.onProgress - Callback khi animation tiến triển (nhận giá trị từ 0-100)
     */
    constructor(options = {}) {
        this.typingSpeed = options.typingSpeed || 30; // ms per character
        this.pauseBetweenWords = options.pauseBetweenWords || 100; // ms
        this.pauseBetweenSentences = options.pauseBetweenSentences || 500; // ms
        this.pauseBetweenParagraphs = options.pauseBetweenParagraphs || 800; // ms
        this.onComplete = options.onComplete || (() => { });
        this.onProgress = options.onProgress || (() => { });

        this.isAnimating = false;
        this.isPaused = false;
        this.queue = [];
        this.currentIndex = 0;
        this.totalCharacters = 0;
        this.typedCharacters = 0;
        this.processItems = 0;
    }

    /**
     * Dừng animation hiện tại
     */
    stop() {
        this.isAnimating = false;
        if (this.currentTimeout) {
            clearTimeout(this.currentTimeout);
        }
    }

    /**
     * Tạm dừng animation
     */
    pause() {
        this.isPaused = true;
    }

    /**
     * Tiếp tục animation sau khi tạm dừng
     */
    resume() {
        this.isPaused = false;
        if (this.isAnimating) {
            this._processQueue();
        }
    }

    /**
     * Hoàn thành ngay lập tức animation, hiển thị toàn bộ nội dung
     */
    complete() {
        this.stop();

        // Hiển thị toàn bộ nội dung cho tất cả các phần tử trong hàng đợi
        this.queue.forEach(item => {
            if (item.element) {
                if (item.type === 'text') {
                    item.element.textContent = item.fullText;
                } else if (item.type === 'html') {
                    item.element.innerHTML = item.fullText;
                }
            }
        });

        this.onProgress(100);
        this.onComplete();
    }

    /**
     * Thêm văn bản vào hàng đợi animation
     * 
     * @param {HTMLElement} element - Phần tử DOM để hiển thị văn bản
     * @param {string} text - Văn bản để hiển thị
     * @param {Object} options - Tùy chọn cho phần văn bản này
     */
    addTextToQueue(element, text, options = {}) {
        this.queue.push({
            element,
            fullText: text,
            currentText: '',
            type: 'text',
            options: {
                typingSpeed: options.typingSpeed || this.typingSpeed,
                pauseBetweenWords: options.pauseBetweenWords || this.pauseBetweenWords,
                pauseBetweenSentences: options.pauseBetweenSentences || this.pauseBetweenSentences
            }
        });

        this.totalCharacters += text.length;
    }

    /**
     * Thêm HTML vào hàng đợi animation
     * 
     * @param {HTMLElement} element - Phần tử DOM để hiển thị HTML
     * @param {string} html - HTML để hiển thị
     * @param {Object} options - Tùy chọn cho phần HTML này
     */
    addHtmlToQueue(element, html, options = {}) {
        // Tạo một phần tử tạm thời để đếm số ký tự thực sự
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = html;
        const textContent = tempDiv.textContent;

        this.queue.push({
            element,
            fullText: html,
            currentText: '',
            type: 'html',
            textContent,
            options: {
                typingSpeed: options.typingSpeed || this.typingSpeed,
                pauseBetweenWords: options.pauseBetweenWords || this.pauseBetweenWords,
                pauseBetweenSentences: options.pauseBetweenSentences || this.pauseBetweenSentences
            }
        });

        this.totalCharacters += textContent.length;
    }

    /**
     * Thêm thời gian tạm dừng vào hàng đợi
     * 
     * @param {number} duration - Thời gian tạm dừng (ms)
     */
    addPause(duration) {
        this.queue.push({
            type: 'pause',
            duration
        });
    }

    /**
     * Bắt đầu animation
     */
    start() {
        if (this.isAnimating || this.queue.length === 0) return;

        this.isAnimating = true;
        this.currentIndex = 0;
        this.typedCharacters = 0;
        this._processQueue();
    }

    /**
     * Xử lý hàng đợi animation
     * @private
     */
    _processQueue() {
        if (!this.isAnimating || this.isPaused) return;

        if (this.currentIndex >= this.queue.length) {
            this.isAnimating = false;
            this.onProgress(100);
            this.onComplete();
            return;
        }

        const currentItem = this.queue[this.currentIndex];

        if (currentItem.type === 'pause') {
            this.currentTimeout = setTimeout(() => {
                this.currentIndex++;
                this.processItems++;

                const progress = Math.floor((this.processItems / this.queue.length) * 100);
                this.onProgress(progress);

                this._processQueue();
            }, currentItem.duration);
        } else if (currentItem.type === 'text' || currentItem.type === 'html') {
            this._animateText(currentItem);
        }
    }

    /**
 * Tạo animation cho một phần tử văn bản
 * 
 * @param {Object} item - Phần tử trong hàng đợi
 * @private
 */
    _animateText(item) {
        if (!this.isAnimating || this.isPaused) return;

        const fullText = item.type === 'text' ? item.fullText : item.textContent;

        if (item.currentText.length >= fullText.length) {
            this.currentIndex++;
            this.processedItems++; // Tăng số mục đã xử lý

            // Cập nhật tiến trình dựa trên tỷ lệ mục đã xử lý và ký tự đã gõ
            const itemProgress = this.processedItems / this.queue.length;
            const charProgress = this.typedCharacters / this.totalCharacters;
            const progress = Math.floor((itemProgress * 0.7 + charProgress * 0.3) * 100);
            this.onProgress(Math.min(progress, 99)); // Giới hạn ở 99% cho đến khi hoàn thành

            this.currentTimeout = setTimeout(() => {
                this._processQueue();
            }, this.pauseBetweenParagraphs);
            return;
        }

        // Xác định ký tự tiếp theo
        const nextChar = fullText[item.currentText.length];
        item.currentText += nextChar;
        this.typedCharacters++;

        // Cập nhật tiến trình kết hợp giữa số mục và số ký tự
        const itemProgress = (this.currentIndex / this.queue.length);
        const charProgress = (this.typedCharacters / this.totalCharacters);
        const progress = Math.floor((itemProgress * 0.5 + charProgress * 0.5) * 100);
        this.onProgress(Math.min(progress, 99)); // Giới hạn ở 99% cho đến khi hoàn thành

        // Hiển thị văn bản hiện tại
        if (item.type === 'text') {
            item.element.textContent = item.currentText;
        } else {
            // Đối với HTML, chúng ta cần một cách tiếp cận khác
            // Chúng ta sẽ hiển thị HTML đầy đủ nhưng với phần chưa hiển thị được ẩn
            const visibleLength = item.currentText.length;
            const htmlWithVisibility = this._createPartiallyVisibleHtml(item.fullText, visibleLength);
            item.element.innerHTML = htmlWithVisibility;
        }

        // Xác định thời gian chờ cho ký tự tiếp theo
        let delay = item.options.typingSpeed;

        // Tạm dừng lâu hơn sau dấu câu
        if (['.', '!', '?', ':', ';'].includes(nextChar)) {
            delay = item.options.pauseBetweenSentences;
        }
        // Tạm dừng ngắn sau khoảng trắng (kết thúc từ)
        else if (nextChar === ' ') {
            delay = item.options.pauseBetweenWords;
        }

        // Lên lịch cho ký tự tiếp theo
        this.currentTimeout = setTimeout(() => {
            this._animateText(item);
        }, delay);
    }

    /**
     * Tạo HTML với phần chưa hiển thị được ẩn
     * 
     * @param {string} html - HTML đầy đủ
     * @param {number} visibleLength - Số ký tự hiển thị
     * @returns {string} HTML với phần chưa hiển thị được ẩn
     * @private
     */
    _createPartiallyVisibleHtml(html, visibleLength) {
        // Đây là một cách đơn giản để hiển thị HTML một phần
        // Trong thực tế, bạn có thể cần một giải pháp phức tạp hơn
        // để xử lý các thẻ HTML đúng cách

        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = html;

        // Hàm đệ quy để duyệt qua các node và ẩn văn bản
        const processNode = (node, remainingChars) => {
            if (remainingChars <= 0) {
                // Ẩn tất cả các node còn lại
                node.style.visibility = 'hidden';
                return 0;
            }

            if (node.nodeType === Node.TEXT_NODE) {
                const text = node.textContent;
                if (text.length <= remainingChars) {
                    // Hiển thị toàn bộ node văn bản này
                    return remainingChars - text.length;
                } else {
                    // Chia node văn bản thành phần hiển thị và phần ẩn
                    const visibleText = text.substring(0, remainingChars);
                    const hiddenText = text.substring(remainingChars);

                    const visibleSpan = document.createElement('span');
                    visibleSpan.textContent = visibleText;

                    const hiddenSpan = document.createElement('span');
                    hiddenSpan.textContent = hiddenText;
                    hiddenSpan.style.visibility = 'hidden';

                    const parent = node.parentNode;
                    parent.insertBefore(visibleSpan, node);
                    parent.insertBefore(hiddenSpan, node);
                    parent.removeChild(node);

                    return 0;
                }
            } else if (node.nodeType === Node.ELEMENT_NODE) {
                let remaining = remainingChars;
                const childNodes = Array.from(node.childNodes);

                for (const child of childNodes) {
                    remaining = processNode(child, remaining);
                    if (remaining <= 0) break;
                }

                return remaining;
            }

            return remainingChars;
        };

        processNode(tempDiv, visibleLength);
        return tempDiv.innerHTML;
    }
}

// Xuất lớp để sử dụng trong các file khác
if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
    module.exports = TypingAnimation;
} else {
    window.TypingAnimation = TypingAnimation;
}