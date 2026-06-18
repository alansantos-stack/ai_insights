import { Test, TestingModule } from '@nestjs/testing';
import { InsightsController } from './insights.controller';
import { InsightsService } from './insights.service';
import { SnowflakeService } from '../snowflake/snowflake.service';
import { InsightRecord } from '../shared/types';

const mockInsightRecord: InsightRecord = {
  id: 'abc-123',
  runDate: '2026-06-18',
  query: 'SELECT ...',
  result: { RESULT: 'some insight' },
  savedAt: '2026-06-18T00:00:00.000Z',
};

describe('InsightsController', () => {
  let controller: InsightsController;
  let insightsService: { findAll: jest.Mock; save: jest.Mock };
  let snowflakeService: { runCortexQuery: jest.Mock };

  beforeEach(async () => {
    insightsService = {
      findAll: jest.fn(),
      save: jest.fn(),
    };

    snowflakeService = {
      runCortexQuery: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [InsightsController],
      providers: [
        { provide: InsightsService, useValue: insightsService },
        { provide: SnowflakeService, useValue: snowflakeService },
      ],
    }).compile();

    controller = module.get<InsightsController>(InsightsController);
  });

  describe('GET /insights (findAll)', () => {
    it('should return the array from insightsService.findAll()', () => {
      const records: InsightRecord[] = [mockInsightRecord];
      insightsService.findAll.mockReturnValue(records);

      const result = controller.findAll();

      expect(result).toEqual(records);
      expect(insightsService.findAll).toHaveBeenCalledTimes(1);
    });
  });

  describe('POST /insights/trigger', () => {
    it('should save the result and return { triggered: true, saved: true } when Cortex returns a record', async () => {
      snowflakeService.runCortexQuery.mockResolvedValue(mockInsightRecord);

      const response = await controller.trigger();

      expect(response).toEqual({ triggered: true, saved: true });
      expect(snowflakeService.runCortexQuery).toHaveBeenCalledTimes(1);
      expect(insightsService.save).toHaveBeenCalledWith(mockInsightRecord);
    });

    it('should not save and return { triggered: true, saved: false } when Cortex returns null', async () => {
      snowflakeService.runCortexQuery.mockResolvedValue(null);

      const response = await controller.trigger();

      expect(response).toEqual({ triggered: true, saved: false });
      expect(snowflakeService.runCortexQuery).toHaveBeenCalledTimes(1);
      expect(insightsService.save).not.toHaveBeenCalled();
    });
  });
});
