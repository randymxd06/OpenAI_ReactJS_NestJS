import * as fs from "fs";
import * as path from "path";
import { Injectable, NotFoundException } from '@nestjs/common';
import { audioToTextUseCase, imageGenerationUseCase, imageVariationUseCase, orthographyCheckUseCase, prosConsDiscusserStreamUseCase, prosConsDiscusserUseCase, textToAudioUseCase, translateUseCase } from './use_cases';
import { AudioToTextDto, ImageVariationDto, OrthographyDto, ProsConsDiscusserDto, TextToAudioDto, TranslateDto } from './dto';
import OpenAI from 'openai';
import { ImageGenerationDto } from './dto/image_generation.dto';

@Injectable()
export class GptService {

    private openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
    })

    //* YOU WILL ONLY CALL USE CASES //

    async orthographyCheck({ prompt }: OrthographyDto) {
        return await orthographyCheckUseCase(this.openai, { prompt });
    }
    
    async prosConsDiscusser({ prompt }: ProsConsDiscusserDto) {
        return await prosConsDiscusserUseCase(this.openai, { prompt });
    }
    
    async prosConsDiscusserStream({ prompt }: ProsConsDiscusserDto) {
        return await prosConsDiscusserStreamUseCase(this.openai, { prompt });
    }

    async translate({ prompt, lang }: TranslateDto) {
        return await translateUseCase(this.openai, { prompt, lang });
    }
    
    async textToAudio({ prompt, voice }: TextToAudioDto) {
        return await textToAudioUseCase(this.openai, { prompt, voice });
    }

    async getAudio( id: string ){
        const filePath = path.resolve( __dirname, '../../generated/audios/', `${id}.mp3` );
        const wasFound = fs.existsSync(filePath);
        if( !wasFound ) throw new NotFoundException(`File ${id}.mp3 not found`);
        return filePath;
    }

    async audioToText(audioFile: Express.Multer.File, { prompt }: AudioToTextDto) {
        return await audioToTextUseCase(this.openai, { audioFile, prompt });
    }
    
    async imageGeneration(imageGenerationDto: ImageGenerationDto) {
        return await imageGenerationUseCase(this.openai, { ...imageGenerationDto });
    }

    getGeneratedImage(fileName: string) {

        const filePath = path.resolve('./', './generated/images/', fileName);
        const exists = fs.existsSync(filePath);

        if( !exists ) {
            throw new NotFoundException('File not found');
        }

        return filePath;

    }

    async generateImageVariation({ baseImage }: ImageVariationDto) {
        return imageVariationUseCase(this.openai, { baseImage });
    }

}
