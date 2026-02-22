import { Resolver, Query, Mutation, Args, Context } from '@nestjs/graphql';
import { LearningLogType, LearningLogInput, DashboardData } from '../types/learning-log.type';
import { LearningLogsService } from '../../learning-logs/learning-logs.service';
import { UsersService } from '../../users/users.service';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';

@Resolver()
export class LearningLogsResolver {
  constructor(
    private learningLogsService: LearningLogsService,
    private usersService: UsersService,
  ) {}

  @Query(() => [LearningLogType])
  @UseGuards(JwtAuthGuard)
  async learningLogs(@Context() context: any): Promise<LearningLogType[]> {
    const logs = await this.learningLogsService.findAll(context.req.user);
    return logs as any;
  }

  @Mutation(() => [LearningLogType])
  @UseGuards(JwtAuthGuard)
  async saveLearningLogs(
    @Args('results', { type: () => [LearningLogInput] }) results: LearningLogInput[],
    @Context() context: any,
  ): Promise<LearningLogType[]> {
    const mappedResults = results.map(r => ({
      questionId: r.questionId,
      isCorrect: r.is_correct,
    }));
    const logs = await this.learningLogsService.createLogs(context.req.user, mappedResults);
    return logs as any;
  }
}
