import { pipeline, env } from '@huggingface/transformers';

// Skip local model check
env.allowLocalModels = false;

class AutomaticSpeechRecognitionPipeline {
    static task = 'automatic-speech-recognition';
    static model = 'onnx-community/whisper-base';
    static instance = null;

    static async getInstance(progress_callback = null) {
        if (this.instance === null) {
            this.instance = pipeline(this.task, this.model, {
                quantized: false,
                progress_callback,
                dtype: {
                    encoder_model: 'fp32',
                    decoder_model_merged: 'q4', // or 'fp32' ('fp16' is broken)
                },
                device: 'webgpu',
            });
        }
        return this.instance;
    }
}

// Listen for messages from main thread
self.addEventListener('message', async (e) => {
    const { type, audio } = e.data;

    if (type === 'load') {
        // Load model
        self.postMessage({
            type: 'loading',
            message: 'Loading model...'
        });

        const transcriber = await AutomaticSpeechRecognitionPipeline.getInstance((data) => {
            self.postMessage({
                type: 'loading',
                file: data.file,
                progress: data.progress,
                loaded: data.loaded,
                total: data.total,
            });
        });

        self.postMessage({
            type: 'loaded',
            message: 'Model loaded successfully!'
        });

    } else if (type === 'generate') {
        // Run inference
        self.postMessage({
            type: 'start',
            message: 'Starting transcription...'
        });

        const start_time = performance.now();

        try {
            const transcriber = await AutomaticSpeechRecognitionPipeline.getInstance();
            
            const output = await transcriber(audio, {
                language: 'english',
                task: 'transcribe',
                return_timestamps: true,
                chunk_length_s: 30,
                stride_length_s: 5,
            });

            const end_time = performance.now();
            const execution_time = (end_time - start_time) / 1000;

            self.postMessage({
                type: 'complete',
                output: output,
                execution_time: execution_time.toFixed(2)
            });

        } catch (error) {
            self.postMessage({
                type: 'error',
                message: error.message
            });
        }
    }
});