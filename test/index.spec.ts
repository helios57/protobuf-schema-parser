import ProtoBuffSchemaParserDefault, {ProtoBuffSchemaParser} from '../src';

const VALID_PROTO = `
syntax = "proto3";

// A point on a plane
message Point {
    // The coordinate on the x axis.
    optional int32 x = 1;
}
`;

const INVALID_PROTO = `
syntax = "proto3";

message Broken {
    optional MissingType missing = 1
}
`;

describe('ProtoBuffSchemaParser()', function () {
  const parser = ProtoBuffSchemaParser();

  it('should be reachable as a named and as a default export', function () {
    expect(ProtoBuffSchemaParserDefault).toBe(ProtoBuffSchemaParser);
    expect(ProtoBuffSchemaParserDefault()).toEqual(parser);
  });

  it('should announce the Protobuf 2 and 3 mime types', function () {
    expect(parser.getMimeTypes()).toEqual([
      'application/vnd.google.protobuf;version=2',
      'application/vnd.google.protobuf;version=3',
    ]);
  });

  it('should report no findings for a valid schema', async function () {
    const findings = await parser.validate({data: VALID_PROTO, path: ['components', 'messages']} as any);

    expect(findings).toEqual([]);
  });

  it('should report the parse error and the input path for an invalid schema', async function () {
    const path = ['components', 'messages', 'testMessage', 'payload'];
    const findings = await parser.validate({data: INVALID_PROTO, path} as any);

    expect(findings).toHaveLength(1);
    expect(findings[0].path).toEqual(path);
    expect(findings[0].message).toBeTruthy();
    expect(findings[0].message).not.toEqual('Unknown Error');
  });

  it('should compile the root message when parsing', function () {
    const schema = parser.parse({data: VALID_PROTO} as any) as any;

    expect(schema.title).toEqual('Point');
    expect(schema.type).toEqual('object');
    expect(schema.description).toEqual('A point on a plane');
    expect(schema.properties.x.description).toEqual('The coordinate on the x axis.');
  });
});
