export class WorkflowRepositoryMock {
    private workflows: { [id: string]: any } = {};
  
    async findOne(id: string): Promise<any> {
      return this.workflows[id] || null;
    }
  
    async save(workflow: any): Promise<any> {
      this.workflows[workflow.id] = workflow;
      return workflow;
    }
  
    async updateWorkflow(id: string, data: Partial<any>): Promise<any> {
      if (this.workflows[id]) {
        this.workflows[id] = { ...this.workflows[id], ...data };
        return this.workflows[id];
      }
      return null;
    }
  }