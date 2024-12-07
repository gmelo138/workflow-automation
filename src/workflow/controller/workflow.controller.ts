import {
  Body,
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiResponse,
  ApiOperation,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';
import {
  WorkflowCommandService,
  WorkflowExecutionService,
  WorkflowStateService,
} from '../service';
import {
  CreateWorkflowDto,
  UpdateWorkflowDto,
  WorkflowDto,
} from 'src/workflow/dto';
@ApiTags('Workflow')
@Controller('workflows')
export class WorkflowController {
  constructor(
    private readonly workflowCommandService: WorkflowCommandService,
    private readonly workflowExecutionService: WorkflowExecutionService,
    private readonly workflowStateService: WorkflowStateService,
  ) {}

  @Post()
  @UsePipes(new ValidationPipe({ transform: true }))
  @ApiOperation({
    summary: 'Create a new workflow',
    description: 'Create a workflow with a specific trigger and actions.',
  })
  @ApiResponse({
    status: 201,
    description: 'The workflow has been created successfully.',
    type: WorkflowDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid input data.' })
  @ApiBody({
    type: CreateWorkflowDto,
    examples: {
      example1: {
        summary: 'Daily Report Generator',
        value: {
          name: 'Daily Report Generator',
          trigger: { type: 'time-based', params: { interval: 'daily' } },
          actions: [
            {
              type: 'httpRequest',
              params: { url: 'https://api.example.com/report', method: 'GET' },
            },
            {
              type: 'logMessage',
              params: { message: 'Daily report generated' },
            },
          ],
        },
      },
    },
  })
  async create(
    @Body() createWorkflowDto: CreateWorkflowDto,
  ): Promise<WorkflowDto> {
    return this.workflowCommandService.createWorkflow(createWorkflowDto);
  }

  @Get()
  @ApiOperation({
    summary: 'Retrieve all workflows',
    description: 'Fetch all the workflows stored in the system.',
  })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved the list of workflows.',
    type: [WorkflowDto],
  })
  async findAll(): Promise<WorkflowDto[]> {
    return this.workflowCommandService.getAllWorkflows();
  }

  @Put(':id')
  @UsePipes(new ValidationPipe({ transform: true }))
  @ApiOperation({
    summary: 'Update an existing workflow',
    description: 'Update the details of an existing workflow by its ID.',
  })
  @ApiParam({ name: 'id', description: 'ID of the workflow to update.' })
  @ApiResponse({
    status: 200,
    description: 'The workflow has been updated successfully.',
    type: WorkflowDto,
  })
  @ApiResponse({ status: 404, description: 'Workflow not found.' })
  async update(
    @Param('id') id: string,
    @Body() updateDto: UpdateWorkflowDto,
  ): Promise<WorkflowDto> {
    return this.workflowCommandService.updateWorkflow(id, updateDto);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Delete a workflow',
    description: 'Delete a workflow by its ID.',
  })
  @ApiParam({ name: 'id', description: 'ID of the workflow to delete.' })
  @ApiResponse({
    status: 204,
    description: 'The workflow has been deleted successfully.',
  })
  @ApiResponse({ status: 404, description: 'Workflow not found.' })
  async remove(@Param('id') id: string): Promise<void> {
    return this.workflowCommandService.deleteWorkflow(id);
  }

  @Post(':id/trigger')
  @ApiOperation({
    summary: 'Trigger a workflow',
    description: 'Manually trigger the execution of a workflow by its ID.',
  })
  @ApiParam({ name: 'id', description: 'ID of the workflow to trigger.' })
  @ApiResponse({
    status: 200,
    description: 'Workflow has been enqueued for execution.',
  })
  @ApiResponse({ status: 404, description: 'Workflow not found.' })
  async trigger(@Param('id') id: string): Promise<void> {
    await this.workflowExecutionService.enqueueWorkflow(id);
  }

  @Get(':id/state')
  @ApiOperation({
    summary: 'Get the current state of a workflow',
    description: 'Retrieve the state of a workflow execution by its ID.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID of the workflow to retrieve the state.',
  })
  @ApiResponse({
    status: 200,
    description: 'Current state of the workflow retrieved successfully.',
    schema: {
      example: {
        step: 1,
        status: 'running',
        error: null,
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Workflow state not found.' })
  async getState(@Param('id') id: string): Promise<Record<string, any> | null> {
    return this.workflowStateService.getExecutionState(id);
  }
}
