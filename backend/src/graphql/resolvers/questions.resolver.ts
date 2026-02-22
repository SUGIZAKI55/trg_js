import { Resolver, Query, Mutation, Args, Context, Int } from '@nestjs/graphql';
import { QuestionType, CreateQuestionInput, UpdateQuestionInput } from '../types/question.type';
import { QuestionsService } from '../../questions/questions.service';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';

@Resolver()
export class QuestionsResolver {
  constructor(private questionsService: QuestionsService) {}

  @Query(() => [QuestionType])
  @UseGuards(JwtAuthGuard)
  async questions(@Context() context: any): Promise<QuestionType[]> {
    const questions = await this.questionsService.findAll(context.req.user);
    return questions.map(q => this.convertQuestion(q));
  }

  @Query(() => [QuestionType])
  async commonQuestions(): Promise<QuestionType[]> {
    const questions = await this.questionsService.findCommon();
    return questions.map(q => this.convertQuestion(q));
  }

  @Query(() => [String])
  @UseGuards(JwtAuthGuard)
  async questionGenres(@Context() context: any): Promise<string[]> {
    return this.questionsService.getGenres(context.req.user);
  }

  @Query(() => [QuestionType])
  @UseGuards(JwtAuthGuard)
  async quizQuestions(
    @Args('genre') genre: string,
    @Args('count', { type: () => Int }) count: number,
    @Context() context: any,
  ): Promise<QuestionType[]> {
    const questions = await this.questionsService.getQuizQuestions(
      genre,
      count,
      context.req.user,
    );
    return questions.map(q => this.convertQuestion(q));
  }

  private convertQuestion(question: any): QuestionType {
    return {
      ...question,
      choices: this.parseChoices(question.choices),
      answer: this.parseAnswer(question.answer),
    };
  }

  private parseChoices(choicesStr: string): string[] {
    if (!choicesStr) return [];
    try {
      if (choicesStr.startsWith('[')) {
        return JSON.parse(choicesStr);
      }
      return choicesStr.split('|').map(c => c.trim());
    } catch {
      return [choicesStr];
    }
  }

  private parseAnswer(answerStr: string): string[] {
    if (!answerStr) return [];
    return answerStr.split(',').map(a => a.trim());
  }
}
