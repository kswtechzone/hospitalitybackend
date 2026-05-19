import { Controller, Get, Post, Body, UseGuards, Request, Param } from '@nestjs/common';
import { FinanceService } from './finance.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { TenantGuard } from '../auth/tenant.guard';

@UseGuards(JwtAuthGuard, TenantGuard)
@Controller('api/v1/finance')
export class FinanceController {
  constructor(private readonly financeService: FinanceService) {}

  @Get('invoices')
  getInvoices(@Request() req) {
    return this.financeService.getInvoices(req.tenantId);
  }

  @Post('invoices')
  createInvoice(@Body() data: any, @Request() req) {
    return this.financeService.createInvoice(req.tenantId, data);
  }

  @Post('invoices/generate-booking/:bookingId')
  generateBookingInvoice(@Param('bookingId') bookingId: string, @Request() req) {
    return this.financeService.generateBookingInvoice(req.tenantId, bookingId);
  }

  @Get('expenses')
  getExpenses(@Request() req) {
    return this.financeService.getExpenses(req.tenantId);
  }

  @Post('expenses')
  createExpense(@Body() data: any, @Request() req) {
    return this.financeService.createExpense(req.tenantId, data);
  }
}
