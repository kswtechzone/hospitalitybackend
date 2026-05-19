import { OnModuleInit, OnModuleDestroy } from '@nestjs/common';
export declare class PrismaService implements OnModuleInit, OnModuleDestroy {
    client: any;
    constructor();
    onModuleInit(): Promise<void>;
    onModuleDestroy(): Promise<void>;
}
