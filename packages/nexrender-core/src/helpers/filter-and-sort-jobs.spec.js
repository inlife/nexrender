const filterAndSortJobs = require('./filter-and-sort-jobs');
describe('filterAndSortJobs', function () {
    it('sorts based on createdAt job', () => {
        const jobs = [
            { id: 2, createdAt: new Date('2022-01-01') },
            { id: 3, createdAt: new Date('2023-01-01') },
            { id: 1, createdAt: new Date('2021-01-01') },
        ];

        expect(filterAndSortJobs(jobs).map(({ id }) => id)).toEqual([1, 2, 3])
    })

    describe('filtering jobs', () => {
        const jobs = [
            {
                id: 1,
                type: 'ct-analysis',
                ct: {
                    attributes: {
                        a: 1,
                        b: false,
                        c: 'testString',
                        d: ['arrValue1', 'arrValue2'],
                    }
                }
            },
            {
                id: 2,
                type: 'ct-analysis',
                ct: {
                    attributes: {
                        a: 2,
                        b: true,
                        c: 'anotherString',
                        d: ['arrValue3'],
                    }
                }
            },
        ];

        it('filter jobs by numeric value', () => {
            const res = filterAndSortJobs(jobs, [{ type: 'ct-analysis', filterPolicy: { a: 1 }  }])
            expect(res).toEqual([expect.objectContaining({ id: 1 })])
        })

        it('filter jobs by boolean value', () => {
            const res = filterAndSortJobs(jobs, [{ type: 'ct-analysis', filterPolicy: { b: false }  }])
            expect(res).toEqual([expect.objectContaining({ id: 1 })])
        })

        it('filter jobs by string value', () => {
            const res = filterAndSortJobs(jobs, [{ type: 'ct-analysis', filterPolicy: { c: 'testString' }  }])
            expect(res).toEqual([expect.objectContaining({ id: 1 })])
        })

        it('filter jobs by multiple fields (AND case)', () => {
            const res = filterAndSortJobs(jobs, [{ type: 'ct-analysis', filterPolicy: { a: 1, b: false }  }])
            expect(res).toEqual([expect.objectContaining({ id: 1 })])
        })

        it('filter jobs by multiple values (OR case)', () => {
            const res = filterAndSortJobs(jobs, [{ type: 'ct-analysis', filterPolicy: { a: [ 1, 3 ]}  }])
            expect(res).toEqual([expect.objectContaining({ id: 1 })])

            const res2 = filterAndSortJobs(jobs, [{ type: 'ct-analysis', filterPolicy: { c: ['testString', 'abc'] }  }])
            expect(res2).toEqual([expect.objectContaining({ id: 1 })])
        })

        it('filter jobs by multiple values (at least one match)', () => {
            const res = filterAndSortJobs(jobs, [{ type: 'ct-analysis', filterPolicy: { d: 'arrValue1' }  }])
            expect(res).toEqual([expect.objectContaining({ id: 1 })])

            const res2 = filterAndSortJobs(jobs, [{ type: 'ct-analysis', filterPolicy: { d: ['arrValue1'] }  }])
            expect(res2).toEqual([expect.objectContaining({ id: 1 })])

            const res3 = filterAndSortJobs(jobs, [{ type: 'ct-analysis', filterPolicy: { d: ['arrValue1', 'abc'] }  }])
            expect(res3).toEqual([expect.objectContaining({ id: 1 })])
        })

        it('filter jobs based on type', () => {
            const jobs = [
                { id: 2, type: 'ct-analysis' },
                { id: 3, type: 'ct-automation' },
                { id: 1, type: 'default' },
            ];

            expect(filterAndSortJobs(jobs, [{ type: 'ct-automation' }])).toHaveLength(1);
            expect(filterAndSortJobs(jobs, [{ type: 'ct-automation' }])).toEqual([ { id: 3, type: 'ct-automation' } ]);

            expect(filterAndSortJobs(jobs, [{ type: 'ct-automation' }, { type: 'ct-analysis' }])).toEqual(
                [
                    { id: 3, type: 'ct-automation' },
                    { id: 2, type: 'ct-analysis' }
                ]
            );
        })

        it('filter jobs using different configs for the same job type', () => {
            const res = filterAndSortJobs(jobs, [
                { type: 'ct-analysis', filterPolicy: { a: 0 }  },
                { type: 'ct-analysis', filterPolicy: { c: 'testString' } }
            ])
            expect(res).toEqual([expect.objectContaining({ id: 1 })])
        })
    })
});
